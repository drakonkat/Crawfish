const fs = require('fs');
const WebTorrent = require('webtorrent-hybrid');
const {mapTorrent, writeFileSyncRecursive, TORRENTS_KEY, simpleHash, deselectFileFromTorrent} = require("./utility");
const downloadsFolder = require('downloads-folder');
const os = require('os')
const path = require("path");
const PouchDB = require('pouchdb');
const wrtc = require('wrtc')
const WebSocket = require('ws')
const schedule = require('node-schedule');
const wss = require("../../websocket/server");
const moment = require("moment/moment");

userDataPath = path.join(os.homedir(), "Crawfish");

const DOCUMENT_CONF = "configuration";
const ADDED = "ADDED";
const CHECK_ERROR = "CHECK_ERROR";
const ERROR = "ERROR";
const trackers = ['wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com', 'wss://tracker.quix.cf', 'wss://tracker.crawfish.cf']
const rtcConfig =
    {
        "iceServers": [
            {
                "urls": "stun:23.21.150.121"
            },
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:global.stun.twilio.com:3478'
                ]
            },
            {
                "username": "admin",
                "credential": "Password1!",
                "urls": "turn:185.149.22.163:3478"
            },
            {
                "username": "admin",
                "credential": "Password1!",
                "urls": "turn:23.94.202.235:3478"
            }
        ]
    }

class ConfigStorage {
    queue = []
    configuration = {
        speed: {
            alternativeTimeStart: null,
            alternativeTimeEnd: null,
            alternativeDownload: null,
            alternativeUpload: null,
            download: null,
            upload: null,
        },
        torrentPath: "./torrent",
        path: path.join(userDataPath, "config.json"),
        downloadPath: downloadsFolder() || "./Downloads/",
        opts: {
            destroyStoreOnDestroy: false,
            maxConns: 55,        // Max number of connections per torrent (default=55)
            utp: true,
            webSeeds: true,
            downloadLimit: 1250000,   // Max download speed (bytes/sec) over all torrents (default=-1)
            uploadLimit: 1250000,     // Max upload speed (bytes/sec) over all torrents (default=-1)// Enable BEP29 uTorrent transport protocol (default=false)
            torrentPort: 51415,
            tracker: {
                announce: trackers,
                rtcConfig: rtcConfig
            }
        }
    }
    liveData = {
        client: undefined,
        db: new PouchDB(path.join(userDataPath, "config_db"))

    }

    constructor() {
        console.log("Starting the service...", WebTorrent.WEBRTC_SUPPORT, WebTorrent.UTP_SUPPORT)
        let {db} = this.liveData;
        //Check old value from json instead of DB
        if (!fs.existsSync(path.join(userDataPath, "config_db", "LOCK") + "")) {
            writeFileSyncRecursive(path.join(userDataPath, "config_db", "LOCK") + "")
        }
        let result;
        db.get(DOCUMENT_CONF)
            .then(async res => {
                this.configuration = res;
                result = res
            })
            .catch(async (error) => {
                console.error("Error getting data at start: ", error)
                {
                    result = this.readData(this.configuration.path)
                    if (result) {
                        await this.saveData(DOCUMENT_CONF, result)
                        fs.unlinkSync(this.configuration.path)
                    } else {
                        result = this.configuration;
                    }
                }
                await this.saveData(DOCUMENT_CONF, result)
            })
            .finally(async () => {
                this.liveData.client = new WebTorrent({
                    ...result.opts,
                    tracker: {...result.opts.tracker, wrtc: wrtc}
                })
                if (result.speed) {
                    await this.setSpeedConf({
                        ...result.speed,
                        download: result.speed.download || result.opts.downloadLimit,
                        upload: result.speed.upload || result.opts.uploadLimit,
                        alternativeTimeStart: result.speed.alternativeTimeStart ? new Date(Date.parse(result.speed.alternativeTimeStart)) : null,
                        alternativeTimeEnd: result.speed.alternativeTimeEnd ? new Date(Date.parse(result.speed.alternativeTimeEnd)) : null,
                    })
                } else {
                    await this.setSpeedConf({
                        download: result.opts.downloadLimit,
                        upload: result.opts.uploadLimit,
                        alternativeTimeStart: null,
                        alternativeTimeEnd: null,
                    })
                }
                // Verify old settings method
                {
                    let torrents = JSON.parse(result[TORRENTS_KEY] || "[]");
                    if (torrents.length > 0) {
                        try {
                            await db.bulkDocs(torrents.map(t => {
                                return {
                                    ...t,
                                    _id: TORRENTS_KEY + t.infoHash
                                }
                            }));
                            await this.setVariable(TORRENTS_KEY, null)
                        } catch (err) {
                            console.error("Error inserting old style torrent", err);
                        }
                    }

                }
                let torrents = await this.getAllTorrent();
                torrents.forEach((x, index) => {
                    if (!x.paused) {
                        this.liveData.client.add(x.magnet, {
                            path: x.path || this.getDownload(),
                            skipVerify: x.progress >= 1
                        });
                    }
                });

                // Handling torrent error part
                this.liveData.client.on("error", (e) => {
                    this.queue.forEach(x => {
                        x.state = CHECK_ERROR
                        x.message = e.message
                    })
                    console.error("ERROR ON CLIENT: ", e)
                })

                //Handling torrent fetched part
                this.liveData.client.on('torrent', async (torrent) => {
                    console.log("Getting torrent: ", torrent.infoHash)
                    await deselectFileFromTorrent(torrent, db)
                    if (!this.configuration.torrentPath) {
                        await this.setVariable("torrentPath", "./torrent")
                    }
                    if (!fs.existsSync(this.configuration.torrentPath)) {
                        fs.mkdirSync(this.configuration.torrentPath, {recursive: true});
                    }
                    let path = this.configuration.torrentPath + "/" + torrent.name + ".torrent";
                    let file = fs.createWriteStream(path);
                    file.write(torrent.torrentFile);

                })
                console.log("Service started")
                if (process.send) {
                    // Say my process is ready
                    process.send({message: "READY", data: null});
                }
            });
    }

    async add(magnet, torrentOpts, onTorrent) {
        try {
            let id = 0;
            if (this.queue.length > 0) {
                let isPresent = true
                while (isPresent) {
                    id++
                    isPresent = this.queue.map(x => x.id).includes(id);
                }
            }
            let element = {
                id,
                magnet,
                state: ADDED
            }
            this.queue.push(element);

            this.liveData.client.add(magnet, {
                    ...torrentOpts,
                    announce: trackers
                },
                (torrent) => {
                    console.log("On torrent")
                    let index = this.queue.findIndex(x => x.id === id)
                    if (index !== -1) {
                        console.log("On torrent", index, this.queue.length)
                        this.queue.splice(index, 1);
                    }
                    console.log("On torrent", this.queue.length)
                    if (onTorrent) {
                        onTorrent(torrent)
                    }
                });
            let promise = new Promise((resolve, reject) => {
                let wait = () => {
                    let index = this.queue.findIndex(x => x.id === id)
                    if ((index !== -1) && this.queue[index]) {
                        if (this.queue[index].state === ADDED) {
                            if (this.liveData.client.get(magnet)) {
                                return resolve()
                            }
                            console.log("waiting")
                            setTimeout(wait, 1000);
                        } else if (this.queue[index].state === CHECK_ERROR) {
                            if (this.liveData.client.get(magnet)) {
                                return resolve()
                            } else {
                                this.queue[index].state = ERROR
                                let result = this.queue[index];
                                this.queue.splice(index, 1);
                                return reject(result);
                            }
                        } else {
                            return resolve();
                        }
                    } else {
                        return resolve();
                    }
                }
                wait();
            });
            let result = await promise;
        } catch (e) {
            throw e;
        }
    }

    getConf() {
        return this.configuration;
    }

    async setVariable(key, data) {
        this.configuration[key] = data;
        await this.saveData(DOCUMENT_CONF, this.configuration)
    }

    getVariable(key) {
        return this.configuration[key];
    }

    async getAllTorrent() {
        let {db} = this.liveData;
        let result = []
        try {
            result = await db.allDocs({
                include_docs: true,
                startkey: TORRENTS_KEY,
                endkey: TORRENTS_KEY + "\ufff0"
            });
        } catch (err) {
            console.error(err);
        }
        return result.rows.map(x => {
            return {
                ...x.doc,
                id: x.id
            }
        });
    }

    async setDownload(downloadPath) {
        this.configuration.downloadPath = downloadPath;
        await this.saveData(DOCUMENT_CONF, this.configuration)
    }

    getDownload() {
        return this.configuration.downloadPath;
    }


    async setDownloadLimit(speed) {
        this.configuration.opts.downloadLimit = speed;
        this.liveData.client.throttleDownload(speed);
        await this.saveData(DOCUMENT_CONF, this.configuration)
    }

    getDownloadLimit() {
        return this.configuration.opts.downloadLimit;
    }

    async setUploadLimit(speed) {
        this.configuration.opts.uploadLimit = speed;
        this.liveData.client.throttleUpload(speed);
        await this.saveData(DOCUMENT_CONF, this.configuration)
    }

    getUploadLimit() {
        return this.configuration.opts.uploadLimit;
    }

    setServer(server) {
        this.server = server;
        const wssServer = wss(server);
        wssServer.on('connection', (ws) => {
            ws.on('message', async (data) => {

                data = data.toString();
                switch (data) {
                    case "CONF":
                        if (this.liveData.client) {
                            let {
                                alternativeTimeStart,
                                alternativeTimeEnd
                            } = this.configuration.speed;
                            let value = {
                                actualDownload: this.liveData.client.downloadSpeed,
                                actualUpload: this.liveData.client.uploadSpeed,
                                actualRatio: this.liveData.client.ratio,
                                downloadSpeed: this.configuration.opts.downloadLimit,
                                downloadPath: this.configuration.downloadPath,
                                uploadSpeed: this.configuration.opts.uploadLimit,
                                ...this.configuration.speed,
                                alternativeTimeStart: alternativeTimeStart ? moment(alternativeTimeStart).format("HH:mm") : null,
                                alternativeTimeEnd: alternativeTimeEnd ? moment(alternativeTimeEnd).format("HH:mm") : null
                            }
                            ws.send(JSON.stringify({key: data, value}));
                        }
                        break;
                    case "STATUS":
                        let torrents = this.liveData.client.torrents.map(mapTorrent);
                        let oldTorrent = await this.getAllTorrent();
                        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
                        torrents.forEach((t) => {
                            if (t && t.files) {
                                let ot = oldTorrent.find(ot => ot.infoHash == t.infoHash)
                                t.files.forEach((f) => {
                                    f.id = simpleHash(t.infoHash, f.name);
                                    if (ot.files.find(x => f.name === x.name).paused) {
                                        f.paused = true;
                                    }
                                })
                            }
                        })
                        ws.send(JSON.stringify({key: data, value: torrents.map(mapTorrent)}));
                        break;
                    default:
                        if (this.liveData.client) {
                            ws.send(JSON.stringify({
                                key: data,
                                value: {downloadSpeed: this.liveData.client.downloadSpeed}
                            }));
                        }
                }
            });
        });
    }

    async setSpeedConf(speed = {
                           alternativeTimeStart: null,
                           alternativeTimeEnd: null,
                           alternativeDownload: null,
                           alternativeUpload: null,
                           download: 1250000,
                           upload: 1250000,
                       }
    ) {
        let actualTime = new Date();
        let {
            alternativeTimeStart,
            alternativeTimeEnd,
            alternativeDownload,
            alternativeUpload,
            download,
            upload
        } = speed

        this.configuration.speed = speed;
        await this.saveData(DOCUMENT_CONF, this.configuration)
        if (alternativeTimeStart && alternativeTimeEnd) {
            if (this.getTimeInSecondFromDate(actualTime) <= this.getTimeInSecondFromDate(alternativeTimeEnd) && this.getTimeInSecondFromDate(actualTime) >= this.getTimeInSecondFromDate(alternativeTimeStart)) {
                await this.setUploadLimit(alternativeUpload)
                await this.setDownloadLimit(alternativeDownload)
            } else {
                await this.setUploadLimit(upload)
                await this.setDownloadLimit(download)
            }
            {
                await schedule.gracefulShutdown();
                schedule.scheduleJob("0 " + alternativeTimeStart.getMinutes() + " " + alternativeTimeStart.getHours() + " * * *", async () => {
                    await this.setUploadLimit(alternativeUpload)
                    await this.setDownloadLimit(alternativeDownload)
                });
                schedule.scheduleJob("0 " + alternativeTimeEnd.getMinutes() + " " + alternativeTimeEnd.getHours() + " * * *", async () => {
                    await this.setUploadLimit(upload)
                    await this.setDownloadLimit(download)
                });
            }
        } else {
            await this.setUploadLimit(upload)
            await this.setDownloadLimit(download)
        }
    }

    getTimeInSecondFromDate(date = new Date()) {
        if (!date.getHours) {
            date = new Date(Date.parse(date))
        }
        return (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
    }

    readData(name = this.configuration.path) {
        try {
            return JSON.parse(fs.readFileSync(name));
        } catch (e) {
            console.error("Error reading file: " + name)
            return null;
        }
    }

    async saveData(name = DOCUMENT_CONF, data = {}) {
        let {db} = this.liveData;
        try {
            let doc = await db.get(name)
            db.put({
                ...data,
                _id: name,
                _rev: doc._rev
            });
        } catch (err) {
            db.put({
                ...data,
                _id: name
            });
        }

    }
}

module.exports = ConfigStorage;
