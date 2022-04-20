import path from 'path'
import express from 'express'
import {mapTorrent, simpleHash, TORRENTS_KEY} from "./classes/utility.js"

const router = express.Router();


router.post('/add', (req, res, next) => {
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
        }
        let temp = req.app.locals.storage.liveData.client.get(magnet);
        if (temp) {
            temp.resume()
        } else {
            req.app.locals.storage.liveData.client.add(magnet, {path: path || req.app.locals.storage.getDownload()});
            res.status(200).json(req.body);
        }
    } catch (e) {
        console.error("Error adding torrent", e)
    }
});
router.post('/pause', (req, res, next) => {
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
        console.debug('Body:', req.body);
        let temp = req.app.locals.storage.liveData.client.get(req.body.magnet);
        if (temp) {
            let t = mapTorrent(temp);
            let torrents = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
            torrents.forEach((x, index) => {
                if (x.magnet == t.magnet) {
                    torrents[index] = t;
                    torrents[index].paused = true;
                    torrents[index].downloadSpeed = 0;
                    torrents[index].uploadSpeed = 0;
                }
            })
            req.app.locals.storage.setVariable(TORRENTS_KEY, JSON.stringify(torrents))
            temp.destroy()
        }
        res.status(200).json(req.body);
    } catch (e) {
        console.error(e)
    }
});

router.get('/check-status', (req, res, next) => {
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
        let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
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
router.get('/get-file/:filename', (req, res, next) => {
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
            let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
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


router.post('/check-status', (req, res, next) => {
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
            let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
            torrent = oldTorrent.find(x => x.magnet == magnet)
        }
        res.status(200).json(mapTorrent(torrent))
    } catch (e) {
        console.error(e)
    }
});

router.post('/destroy', (req, res, next) => {
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
    let torrents = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
    torrents = torrents.filter(x => x.magnet != req.body.magnet)
    req.app.locals.storage.setVariable(TORRENTS_KEY, JSON.stringify(torrents))
    req.app.locals.storage.liveData.client.get(req.body.magnet).destroy({destroyStore: true});
    res.status(200).json(req.body);
});


router.post('/remove', (req, res, next) => {
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
    let torrents = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
    torrents = torrents.filter(x => x.magnet != req.body.magnet)
    req.app.locals.storage.setVariable(TORRENTS_KEY, JSON.stringify(torrents))
    req.app.locals.storage.liveData.client.get(req.body.magnet).destroy();
    res.status(200).json(req.body);
});

export default router;
