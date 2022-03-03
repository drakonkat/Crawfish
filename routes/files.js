const axios = require('axios');
const FormData = require('form-data');
const fs = require("fs");
const open = require('open')
const {exec, spawn} = require("child_process");
const express = require('express');
const ConfigStorage = require("./classes/ConfigStorage");
const {TORRENTS_KEY, mapTorrent, getExtension, supportedFormats, simpleHash} = require("./classes/utility");
const router = express.Router();

router.get('/list', async (req, res, next) => {
    /*
        #swagger.tags = ['Files']
        #swagger.summary = "Return the list of the file contained in the torrent"
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: [{
                done: true,
                streamable: true,
                name: true,
                id:"asdkjasndlas - Nome"
            }]
        }
    */
    try {
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        let files = [];
        torrents.forEach((t) => {
            if (t && t.files) {
                t.files.forEach((f) => {
                    files.push({
                        done: f.progress >= 1,
                        streamable: supportedFormats.includes(getExtension(f.name)),
                        name: f.name,
                        id: simpleHash(t.infoHash, f.name)
                    })
                })
            }
        })
        res.status(200).json(files)
    } catch (e) {
        console.error(e)
    }
});

router.get('/open', async (req, res, next) => {
    /*
        #swagger.tags = ['files']
        #swagger.summary = "Open the file in the local system"
        #swagger.responses[200] = {
        description: "Open the file in the localsystem and use the id from the file to open it as queryparam named 'fileid'"
    */
    try {
        let opened = false;
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        torrents.forEach((t) => {
            if (!opened && t && t.files) {
                t.files.forEach((f) => {
                    if (!opened && req.query.fileid === simpleHash(t.infoHash, f.name)) {
                        open(f.path);
                        opened = true;
                    }
                })
            }
        })
        res.status(200).json(opened)
    } catch (e) {
        console.error(e)
    }
});


router.get('/stream', async (req, res, next) => {
    /*
        #swagger.tags = ['files']
        #swagger.summary = "Open the file in the local system"
        #swagger.responses[200] = {
        description: "Open the file in the localsystem and use the id from the file to open it as queryparam named 'fileid'"
    */
    try {
        let opened = false;
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        torrents.forEach((t) => {
            if (!opened && t && t.files) {
                t.files.forEach((f) => {
                    if (!opened && req.query.fileid === simpleHash(t.infoHash, f.name)) {
                        res.sendFile(f.path, {root: './'});
                        opened = true;
                    }
                })
            }
        })
    } catch (e) {
        console.error(e)
    }
});

module.exports = router;
