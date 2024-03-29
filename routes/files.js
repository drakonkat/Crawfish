const open = require('open');
const express = require('express');
const {getExtension, mapTorrent, simpleHash, supportedFormats} = require("./classes/utility");
const {crawlFitGirl, crawlMovies1337x, crawlTvShow1337x} = require("./classes/indexers");
const path = require("path");


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
        let oldTorrent = await req.app.locals.storage.getAllTorrent();
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        let files = [];
        torrents.forEach((t) => {
            if (t && t.files) {
                t.files.forEach((f) => {
                    files.push({
                        done: f.progress >= 1,
                        streamable: supportedFormats.includes(getExtension(f.name)),
                        name: f.name,
                        name: f.name,
                        id: simpleHash(t.infoHash, f.name),
                        torrentMagnet: t.magnet
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
        description: "Open the file in the localsystem and use the id  = require( the file to open it as queryparam named 'fileid'"
    */
    try {
        let opened = false;
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = await req.app.locals.storage.getAllTorrent();
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
router.get('/openFolder', async (req, res, next) => {
    /*
        #swagger.tags = ['files']
        #swagger.summary = "Open the folder where the file is"
        #swagger.responses[200] = {
        description: "Open the folder where the file is in the localsystem"
    */
    try {
        let opened = false;
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = await req.app.locals.storage.getAllTorrent();
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        for (const t of torrents) {
            if (!opened && t && t.files && t.infoHash === req.query.torrentId) {
                let f = t.files[0]
                await open(path.dirname(f.path), {wait: true});
                opened = true;
            }
        }
        res.status(200).json(opened)
    } catch (e) {
        console.error(e)
    }
});


router.get('/stream/:filename', async (req, res, next) => {
    /*
        #swagger.tags = ['files']
        #swagger.summary = "Open the file in the local system"
        #swagger.responses[200] = {
        description: "Open the file in the localsystem and use the id  = require( the file to open it as queryparam named 'fileid'"
    */
    try {
        let opened = false;
        let torrents = req.app.locals.storage.liveData.client.torrents.map(mapTorrent);
        let oldTorrent = await req.app.locals.storage.getAllTorrent();
        torrents.push(...oldTorrent.filter(x => !torrents.map(y => y.infoHash).includes(x.infoHash)))
        torrents.forEach((t) => {
            if (!opened && t && t.files) {
                t.files.forEach((f) => {
                    if (!opened && req.query.fileid === simpleHash(t.infoHash, f.name)) {
                        res.sendFile(f.path);
                        opened = true;
                    }
                })
            }
        })
    } catch (e) {
        console.error(e)
    }
});


router.get('/search', async (req, res, next) => {
    /*
        #swagger.tags = ['Files']
        #swagger.summary = "Return a search indexed torrent, based on searx"
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: [{
                "url": "https://xxx.xxx/description.php?id=56842669",
		"title": "Texas Chainsaw Massacre (2022) [720p] [WEBRip]",
		"seed": "91",
		"leech": "31",
		"magnetlink": "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.opentrackr.org:1337&tr=udp://explodie.org:6969&tr=udp://tracker.empire-js.us:1337&tr=wss://tracker.btorrent.xyz&tr=wss://tracker.openwebtorrent.com&ws=https://webtorrent.io/torrents/&xs=https://webtorrent.io/torrents/sintel.torrent",
		"template": "torrent.html",
		"publishedDate": "Feb 19, 2022",
		"filesize": 799469148,
		"engine": "xxx",
		"parsed_url": [
			"https",
			"xxx.xxx",
			"/description.php",
			"",
			"id=56842669",
			""
		],
		"engines": [
			"xxx"
		],
		"positions": [
			7
		],
		"score": 0.14285714285714285,
		"category": "videos",
		"pretty_url": "https://xxx.xxx/description.php?id=56842669",
		"pubdate": "2022-02-19 03:35:55"
            }]
        }
    */
    try {
        let results = await req.app.locals.searx.search(req && req.query && req.query.q);
        res.status(200).json(results)
    } catch (e) {
        console.error(e)
    }
});


router.get('/movie', async (req, res, next) => {
    /*
        #swagger.tags = ['Files']
        #swagger.summary = "Return a result fetched from public 1337x instances"
        #swagger.responses[200] = {
        description: "List of result",
        schema: []
    */
    try {
        try {
            let results = await crawlMovies1337x(req && req.query && req.query.q);
            res.status(200).json(results)
        } catch (e) {
            console.error(e)
            let results = await req.app.locals.searx.search(req && req.query && req.query.q);
            res.status(200).json(results)
        }
    } catch (e) {
        console.error(e)
    }
});

router.get('/tvshow', async (req, res, next) => {
    /*
        #swagger.tags = ['Files']
        #swagger.summary = "Return a result fetched from public 1337x instances"
        #swagger.responses[200] = {
        description: "List of result",
        schema: []
    */
    try {
        try {
            let results = await crawlTvShow1337x(req && req.query && req.query.q);
            res.status(200).json(results)
        } catch (e) {
            console.error(e)
            let results = await req.app.locals.searx.search(req && req.query && req.query.q);
            res.status(200).json(results)
        }
    } catch (e) {
        console.error(e)
    }
});


router.get('/games/:source/', async (req, res, next) => {
    /*
        #swagger.tags = ['Files']
        #swagger.summary = "Indexed search of games parsed  = require( games website"
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: [{
		"name": "Cyberpunk 2077",
		"description": "91",
		"originalSize": "42.2 GB",
        "repackSize": " = require( 17.2 GB [Selective Download]",
		"magnet": []
        }
    */
    try {
        let source = req.params.source
        let q = req && req.query && req.query.q
        let results;
        switch (source) {
            case "FITGIRL":
            default:
                results = await crawlFitGirl(q)
                break;
        }
        res.status(200).json(results)
    } catch (e) {
        console.error(e)
    }
});

module.exports = router;



