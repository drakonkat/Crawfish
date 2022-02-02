const fs = require('fs');
const WebTorrent = require('webtorrent-hybrid');
const {mapTorrent} = require("./utility");
const adapter = require("webrtc-adapter");
const jsdom = require("jsdom");
const wrtc = require("wrtc");
// const WebRTC = require('webrtc-native');

// WebRTC.RTCPeerConnection
// WebRTC.RTCIceCandidate
// WebRTC.RTCSessionDescription
// WebRTC.RTCDataChannel
// WebRTC.MediaStream
// WebRTC.MediaStreamTrack
// WebRTC.getUserMedia
// WebRTC.getSources

const TORRENTS_KEY = "torrent";
const {JSDOM} = jsdom

class ConfigStorage {
    configuration = {
        path: "./config.json",
        downloadPath: "./Downloads/",
        opts: {
            destroyStoreOnDestroy: false,
            maxConns: 20,        // Max number of connections per torrent (default=55)
            utp: true,
            webSeeds: true,
            downloadLimit: 12500,   // Max download speed (bytes/sec) over all torrents (default=-1)
            uploadLimit: 12500,     // Max upload speed (bytes/sec) over all torrents (default=-1)// Enable BEP29 uTorrent transport protocol (default=false)
            torrentPort: 51413,
            tracker: {
                wrtc: wrtc,
                rtcConfig: {
                    iceServers: [
                        {
                            urls: [
                                'stun:stun.l.google.com:19302',
                                'stun:global.stun.twilio.com:3478'
                            ]
                        },
                        {
                            username: "simple",
                            credential: "Password1!",
                            urls: "turn:185.149.22.163:3478"
                        }
                    ]
                }
            }
        }
    }
    liveData = {
        client: new WebTorrent(this.configuration.opts)
    }


    constructor() {
        console.log("Starting the service...", WebTorrent.WEBRTC_SUPPORT, WebTorrent.UTP_SUPPORT)

        let result = this.readData(this.configuration.path)
        if (result == null) {
            result = this.configuration;
            this.saveData(this.configuration.path, result)
        } else {
            this.configuration = result;
        }


        let torrents = JSON.parse(this.getVariable(TORRENTS_KEY) || "[]");
        // console.log("Reload old files saved in config: ", torrents)
        torrents.forEach((x, index) => {
            if (!x.paused) {
                this.liveData.client.add(x.magnet, {path: this.getDownload()});
            }
        });
        this.liveData.client.on("error", (e) => {
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
        })
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
            fs.writeFileSync(name, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Error saving file: " + name, data, e)
            throw e;
        }
    }
}

module.exports = ConfigStorage;
