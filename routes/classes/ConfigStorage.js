const fs = require('fs');
const WebTorrent = require('webtorrent-hybrid');
const {mapTorrent, writeFileSyncRecursive} = require("./utility");
const downloadsFolder = require('downloads-folder');
const os = require('os')
const path = require("path");


const userDataPath = path.join(os.homedir(), "Crawfish");

const TORRENTS_KEY = "torrent";
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
        client: new WebTorrent(this.configuration.opts)
    }

    constructor() {
        console.log("Starting the service...", WebTorrent.WEBRTC_SUPPORT, WebTorrent.UTP_SUPPORT, this.configuration.path)
        let result = this.readData(this.configuration.path)
        if (result == null) {
            result = this.configuration;
            this.saveData(this.configuration.path, result)
        } else {
            this.configuration = result;
        }


        let torrents = JSON.parse(this.getVariable(TORRENTS_KEY) || "[]");
        torrents.forEach((x, index) => {
            if (!x.paused) {
                this.liveData.client.add(x.magnet, {path: x.path || this.getDownload()});
            }
        });
        this.liveData.client.on("error", (e) => {
            this.queue.forEach(x => {
                x.state = CHECK_ERROR
                x.message = e.message
            })
            console.error("ERROR ON CLIENT: ", e)
        })
        this.liveData.client.on('torrent', (torrent) => {
            let t = mapTorrent(torrent);
            let torrents = JSON.parse(this.getVariable(TORRENTS_KEY) || "[]");
            let founded = false;
            torrents.forEach((x, index) => {
                if (x.magnet == t.magnet) {
                    founded = true;
                    torrents[index] = t;
                    torrents[index].paused = true;
                    torrents[index].downloadSpeed = 0;
                    torrents[index].uploadSpeed = 0;
                }
            })
            if (!founded) {
                torrents.push(t)
            }
            this.setVariable(TORRENTS_KEY, JSON.stringify(torrents))
            if (!this.configuration.torrentPath) {
                this.setVariable("torrentPath", "./torrent")
            }
            if (!fs.existsSync(this.configuration.torrentPath)) {
                fs.mkdirSync(this.configuration.torrentPath, {recursive: true});
            }
            let path = this.configuration.torrentPath + "/" + torrent.name + ".torrent";
            let file = fs.createWriteStream(path);
            file.write(torrent.torrentFile);
        })
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
                    if (index || index === 0) {
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
                    if ((index || index === 0) && this.queue[index]) {
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
            console.log("CHECK INDEX: ", result)
        } catch (e) {
            throw e;
        }
    }

    getConf() {
        return this.configuration;
    }

    setPath(path) {
        this.configuration.path = path;
        this.saveData(this.configuration.path, this.configuration)
    }

    setVariable(key, data) {
        this.configuration[key] = data;
        this.saveData(this.configuration.path, this.configuration)
    }

    getVariable(key) {
        return this.configuration[key];
    }

    getPath() {
        return this.configuration.path;
    }

    setDownload(downloadPath) {
        this.configuration.downloadPath = downloadPath;
        this.saveData(this.configuration.path, this.configuration)
    }

    getDownload() {
        return this.configuration.downloadPath;
    }


    setDownloadLimit(speed) {
        this.configuration.opts.downloadLimit = speed;
        this.liveData.client.throttleDownload(speed);
        this.saveData(this.configuration.path, this.configuration)
    }

    getDownloadLimit() {
        return this.configuration.opts.downloadLimit;
    }

    setUploadLimit(speed) {
        this.configuration.opts.uploadLimit = speed;
        this.liveData.client.throttleUpload(speed);
        this.saveData(this.configuration.path, this.configuration)
    }

    getUploadLimit() {
        return this.configuration.opts.uploadLimit;
    }

    readData(name = this.configuration.path) {
        try {
            return JSON.parse(fs.readFileSync(name));
        } catch (e) {
            console.error("Error reading file: " + name, e)
            return null;
        }
    }

    saveData(name = this.configuration.path, data = {}) {
        try {
            writeFileSyncRecursive(name, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Error saving file: " + name, data, e)
            throw e;
        }
    }
}

module.exports = ConfigStorage;
