const express = require ("express");
const router = express.Router();


router.post('/edit', async (req, res, next) => {
    /*
        #swagger.tags = ['Config']
        #swagger.summary = "Modify the configuration about the torrent client"
        #swagger.parameters['config'] = {
            in: 'body',
            description: 'Configuration of the client',
            schema: {
                $path: './'
            }
         }
         #swagger.responses[200] = {
        description: "Set the path",
        schema: true
        }
    */
    await req.app.locals.storage.setDownload(req.body.downloadPath);
    await req.app.locals.storage.setDownloadLimit(req.body.downloadSpeed);
    await req.app.locals.storage.setUploadLimit(req.body.uploadSpeed);
    res.status(200).json(true)
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
    res.status(200).json({
        actualDownload: req.app.locals.storage.liveData.client.downloadSpeed,
        actualUpload: req.app.locals.storage.liveData.client.uploadSpeed,
        actualRatio: req.app.locals.storage.liveData.client.ratio,
        downloadSpeed: req.app.locals.storage.configuration.opts.downloadLimit,
        downloadPath: req.app.locals.storage.configuration.downloadPath,
        uploadSpeed: req.app.locals.storage.configuration.opts.uploadLimit
    })
});

module.exports =  router;
