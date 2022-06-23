const path = require('path')
const express = require('express')
const {mapTorrent, simpleHash, TORRENTS_KEY} = require("./classes/utility")
const axios = require("axios");

const router = express.Router();


router.post('/add', async (req, res, next) => {
    /*
        #swagger.tags = ['Downloads']
        #swagger.summary = "Add a torrent to the list"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Add a torrent',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }
         }
         #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
                $path: './Downloads/personal'
            }]
        }
    */
    try {
        let {magnet, path} = req.body;
        if (magnet && magnet.includes("magnet:?")) {
            magnet = magnet + "&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.quix.cf"
        } else if (magnet && magnet.startsWith("http")) {
            let res = await axios.get(magnet, {
                maxRedirects: 0,
                validateStatus: null
            })
            if (res && res.headers && res.headers.location && res.headers.location.includes("magnet:?")) {
                magnet = res.headers.location
                console.log("Redirected magnet: ", res.headers.location.trim())
            }
        }

        let temp = req.app.locals.storage.liveData.client.get(magnet);
        if (temp) {
            temp.resume()
        } else {
            await req.app.locals.storage.add(magnet, {path: path || req.app.locals.storage.getDownload()});
        }
        res.status(200).json(req.body);
    } catch (e) {
        console.error("Error adding torrent", e)
        res.status(418).json(e);
    }
});
router.post('/pause', async (req, res, next) => {
    /*
        #swagger.tags = ['Downloads']
        #swagger.summary = "Pause a torrent in the list"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Pause a torrent',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintelbuild&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }
         }
         #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }]
        }
    */
    try {
        let {db} = req.app.locals.storage.liveData
        let temp = req.app.locals.storage.liveData.client.get(req.body.magnet);
        if (temp) {
            let t = mapTorrent(temp);
            let foundedTorrent = await db.get(TORRENTS_KEY + t.infoHash);
            if (foundedTorrent) {
                foundedTorrent = {
                    ...t, _rev: foundedTorrent._rev,
                    _id: TORRENTS_KEY + t.infoHash
                };
                foundedTorrent.paused = true;
                foundedTorrent.downloadSpeed = 0;
                foundedTorrent.uploadSpeed = 0;
                db.put(foundedTorrent)
            } else {
                await db.put({
                    ...t,
                    paused: true,
                    downloadSpeed: 0,
                    uploadSpeed: 0,
                    _id: TORRENTS_KEY + t.infoHash
                })
            }
            temp.destroy()
        }
        res.status(200).json(req.body);
    } catch (e) {
        console.error(e)
    }
});

router.get('/check-status', async (req, res, next) => {
    /*
        #swagger.tags = ["Downloads"]
        #swagger.summary = "Check the status of the torrents"
        #swagger.description = "It returns all the detail about the torrent",
        #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $name: x.name,
                $magnet: x.magnetURI,
                $downloaded: x.downloaded,
                $uploaded: x.uploaded,
                $downloadSpeed: x.downloadSpeed,
                $uploadSpeed: x.uploadSpeed,
                $progress: x.progress,
                $ratio: x.ratio,
                $path: x.path,
                $done: x.done
            }]
        }
    }
    */
    try {
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = await req.app.locals.storage.getAllTorrent();
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        torrents.forEach((t) => {
            if (t && t.files) {
                t.files.forEach((f) => {
                    f.id = simpleHash(t.infoHash, f.name);
                })
            }
        })
        res.status(200).json(torrents)
    } catch (e) {
        console.error(e)
    }
});
router.get('/get-file/:filename', async (req, res, next) => {
    /*
        #swagger.tags = ["Downloads"]
        #swagger.summary = "Return the torrent file of selected value"
        #swagger.description = "From the infoHash return the file to download",
        #swagger.responses[200] = {
        description: "The torrent file"
        }
    }
    */
    try {
        let torrentId = req.query.torrentId
        try {
            let opened = false;
            let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
            let oldTorrent = await req.app.locals.storage.getAllTorrent();
            torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
            torrents.forEach((t) => {
                if (!opened && t && t.infoHash === torrentId) {
                    res.download(path.resolve(req.app.locals.storage.getConf().torrentPath + "/" + t.name + ".torrent"));
                    opened = true;
                }
            })
        } catch (e) {
            console.error(e)
        }
    } catch (e) {
        console.error(e)
    }
});


router.post('/check-status', async (req, res, next) => {
    /*
        #swagger.tags = ["Downloads"]
        #swagger.summary = "Check the status of a single torrent"
        #swagger.description = "It returns all the detail about the torrent",
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Id of the torrent',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }
         }
        #swagger.responses[200] = {
        description: "A single torrent information",
        schema: {
                $name: x.name,
                $magnet: x.magnetURI,
                $downloaded: x.downloaded,
                $uploaded: x.uploaded,
                $downloadSpeed: x.downloadSpeed,
                $uploadSpeed: x.uploadSpeed,
                $progress: x.progress,
                $ratio: x.ratio,
                $path: x.path,
                $done: x.done
            }
        }
    }
    */
    try {
        let magnet = req.body.magnet
        let torrent = req.app.locals.storage.liveData.client.get(magnet)
        if (!torrent) {
            let oldTorrent = await req.app.locals.storage.getAllTorrent();
            torrent = oldTorrent.find(x => x.magnet == magnet)
        }
        res.status(200).json(mapTorrent(torrent))
    } catch (e) {
        console.error(e)
    }
});

router.post('/destroy', async (req, res, next) => {
    /*
        #swagger.tags = ['Downloads']
        #swagger.summary = "Remove a torrent in the list"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Remove a torrent and destroy data',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }
         }
         #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }]
        }
    */
    console.debug('Body:', req.body);
    let {db} = req.app.locals.storage.liveData
    let torrent = req.app.locals.storage.liveData.client.get(req.body.magnet);
    if (torrent) {
        try {
            let doc = await db.get(TORRENTS_KEY + torrent.infoHash);
            await db.remove(doc);
        } catch (err) {
            console.log(err);
        }
        torrent.destroy({destroyStore: true});
    }
    res.status(200).json(req.body);
});


router.post('/remove', async (req, res, next) => {
    /*
        #swagger.tags = ['Downloads']
        #swagger.summary = "Remove a torrent in the list, keeping the data"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'Remove a torrent and keep data',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }
         }
         #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }]
        }
    */
    console.debug('Body:', req.body);
    let {db} = req.app.locals.storage.liveData
    let torrent = req.app.locals.storage.liveData.client.get(req.body.magnet);
    if (torrent) {
        try {
            let doc = await db.get(TORRENTS_KEY + torrent.infoHash);
            await db.remove(doc);
        } catch (err) {
            console.log(err);
        }
        torrent.destroy();
    }
    res.status(200).json(req.body);
});

module.exports = router;
