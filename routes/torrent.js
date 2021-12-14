const {exec, spawn} = require("child_process");
const express = require('express');
// const {handleRes} = require("./utility");
const router = express.Router();


router.post('/add', (req, res, next) => {
    /*
        #swagger.tags = ['Torrent']
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
                $id: "specific UUID",
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }]
        }
    */
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.get('/check-status', (req, res, next) => {
    /*
        #swagger.tags = ["Torrent"]
        #swagger.summary = "Check the status of the torrents"
        #swagger.description = "It returns all the detail about the torrent",
        #swagger.responses[200] = {
        description: "A single torrent information",
        schema: [{
                $id: "specific UUID",
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
            }]
        }
    }
    */
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/remove', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/list', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

router.post('/server-status', (req, res, next) => {
    console.log('Body:', req.body);
    res.status(200).json({data: "To be implemented"})
});

module.exports = router;
