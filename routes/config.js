const express = require("express");
const {stringToDate} = require("./classes/utility");
const moment = require("moment");
const router = express.Router();


router.post('/edit', async (req, res, next) => {
    /*
        #swagger.tags = ['Config']
        #swagger.summary = "Modify the configuration about the torrent client"
        #swagger.parameters['config'] = {
            in: 'body',
            description: 'Configuration of the client',
            schema: {
                path: './'
                downloadLimit: '8000'
                uploadLimit: '8000'
            }
         }
         #swagger.responses[200] = {
        description: "Output of the operation",
        schema: true
        }
    */
    let {
        downloadPath,
        download,
        upload,
        alternativeTimeStart,
        alternativeTimeEnd,
        alternativeDownload,
        alternativeUpload,
    } = req.body;

    await req.app.locals.storage.setDownload(downloadPath);
    await req.app.locals.storage.setSpeedConf({
        alternativeTimeStart: stringToDate(alternativeTimeStart),
        alternativeTimeEnd: stringToDate(alternativeTimeEnd),
        alternativeDownload,
        alternativeUpload,
        download,
        upload
    });
    {
        let {
            alternativeTimeStart,
            alternativeTimeEnd
        } = req.app.locals.storage.configuration.speed;
        res.status(200).json({
            actualDownload: req.app.locals.storage.liveData.client.downloadSpeed,
            actualUpload: req.app.locals.storage.liveData.client.uploadSpeed,
            actualRatio: req.app.locals.storage.liveData.client.ratio,
            downloadSpeed: req.app.locals.storage.configuration.opts.downloadLimit,
            downloadPath: req.app.locals.storage.configuration.downloadPath,
            uploadSpeed: req.app.locals.storage.configuration.opts.uploadLimit,
            ...req.app.locals.storage.configuration.speed,
            alternativeTimeStart: alternativeTimeStart ? moment(alternativeTimeStart).format("HH:mm") : null,
            alternativeTimeEnd: alternativeTimeEnd ? moment(alternativeTimeEnd).format("HH:mm") : null
        })
    }
});
router.get('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Config']
        #swagger.summary = "Return the configuration of the torrent"
         #swagger.responses[200] = {
        description: "The configuration",
        schema: true
        }
    */
    let {

        alternativeTimeStart,
        alternativeTimeEnd
    } = req.app.locals.storage.configuration.speed;
    res.status(200).json({
        actualDownload: req.app.locals.storage.liveData.client.downloadSpeed,
        actualUpload: req.app.locals.storage.liveData.client.uploadSpeed,
        actualRatio: req.app.locals.storage.liveData.client.ratio,
        downloadSpeed: req.app.locals.storage.configuration.opts.downloadLimit,
        downloadPath: req.app.locals.storage.configuration.downloadPath,
        uploadSpeed: req.app.locals.storage.configuration.opts.uploadLimit,
        ...req.app.locals.storage.configuration.speed,
        alternativeTimeStart: alternativeTimeStart ? moment(alternativeTimeStart).format("HH:mm") : null,
        alternativeTimeEnd: alternativeTimeEnd ? moment(alternativeTimeEnd).format("HH:mm") : null
    })
});

module.exports = router;
