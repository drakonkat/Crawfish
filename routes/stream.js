import axios from 'axios'
import FormData from 'form-data'
import fs from "fs"
import express from 'express'

const router = express.Router();
const VARIABLE_CONF_STREAM = "configurationStream"
const TORRENTS_KEY = "torrent";


router.post('/upload', async (req, res, next) => {
    /*
        #swagger.tags = ['Stream']
        #swagger.summary = "Upload to a remote a single file"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'File to load',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
                $fileName: 'xxx.mp4'
            }
         }
         #swagger.responses[200] = {
        description: "Result of the operation",
        schema: {
                "files": [
                    {
                        "name": "xxx.mp4",
                        "size": 11111,
                        "url": "https://domain.com/mcurg8n382uy",
                        "deleteUrl": "https://domain.com/mcurg8n382uy?killcode=agdt0meepz"
                    }
                ]
            }
        }
    */
    try {
        let streamConf = JSON.parse(req.app.locals.storage.getVariable(VARIABLE_CONF_STREAM) || "{}");
        let token = streamConf.uptobox && streamConf.uptobox.token && streamConf.uptobox.token;

        if (!token || !streamConf.uploadEnabled) {
            if (streamConf.uploadEnabled) {
                res.status(405).json({
                    message: "Missing auth token for uptobox"
                });
            } else {
                res.status(405).json({
                    message: "Upload disabled"
                });
            }

        } else {
            let torrent = req.app.locals.storage.liveData.client.get(req.body.magnet);
            if (!torrent) {
                let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
                torrent = oldTorrent.find(x => x.magnet == req.body.magnet)
            }
            let file = torrent.files.find(x => x.name == req.body.fileName)
            if (!file) {
                res.status(404)
            } else {
                let responseUpload = await axios({
                    method: 'GET',
                    url: 'https://uptobox.com/api/upload?token=' + token,
                })
                let data = new FormData();
                data.append('token', token);
                data.append('file', fs.createReadStream(file.path));
                // data.append('file', fs.createReadStream("./Downloads/a.mp4"));

                let config = {
                    method: "POST",
                    url: "https:" + responseUpload.data.data.uploadLink,
                    maxContentLength: 100000000,
                    maxBodyLength: 1000000000,
                    timeout: 0,
                    headers: {
                        ...data.getHeaders()
                    },
                    data: data
                };

                let uploadResponse = await axios(config);
                res.status(200).json(uploadResponse.data);
            }
        }
    } catch (e) {
        console.error(e)
    }
});


router.post('/check-existing', async (req, res, next) => {
    /*
        #swagger.tags = ['Stream']
        #swagger.summary = "Upload to a remote a single file"
        #swagger.parameters['torrent'] = {
            in: 'body',
            description: 'File to load',
            schema: {
                $magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
                $fileName: 'xxx.mp4'
            }
         }
         #swagger.responses[200] = {
        description: "Result of the operation",
        schema: {
                "files": [
                    {
                        "name": "xxx.mp4",
                        "size": 11111,
                        "url": "https://domain.com/mcurg8n382uy",
                        "deleteUrl": "https://domain.com/mcurg8n382uy?killcode=agdt0meepz"
                    }
                ]
            }
        }
    */
    try {
        let streamConf = JSON.parse(req.app.locals.storage.getVariable(VARIABLE_CONF_STREAM) || "{}");
        let token = streamConf.uptobox && streamConf.uptobox.token && streamConf.uptobox.token;

        if (!token || !streamConf.uploadEnabled) {
            if (streamConf.uploadEnabled) {
                res.status(405).json({
                    message: "Missing auth token for uptobox"
                });
            } else {
                res.status(405).json({
                    message: "Upload disabled"
                });
            }

        } else {
            let torrent = req.app.locals.storage.liveData.client.get(req.body.magnet);
            if (!torrent) {
                let oldTorrent = JSON.parse(req.app.locals.storage.getVariable(TORRENTS_KEY) || "[]");
                torrent = oldTorrent.find(x => x.magnet == req.body.magnet)
            }
            let file = torrent.files.find(x => x.name == req.body.fileName)
            if (!file) {
                res.status(404)
            } else {
                let responseSearch = await axios({
                    method: "GET",
                    url: "https://uptobox.com/api/user/files?token=" + token + "&path=//&limit=1&offset=0&searchField=file_name&search=" + file.name,
                })

                res.status(200).json(responseSearch.data.data.files.map(x => {
                    return {
                        name: x.file_name,
                        size: x.file_size,
                        url: "https://domain.com/" + x.file_code
                    }

                }));
            }
        }
    } catch (e) {
        console.error(e)
    }
});


router.get('/config', async (req, res, next) => {
    /*
        #swagger.tags = ['Stream']
        #swagger.summary = "Retrieve the configuration about streaming"
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: {
                $uptobox: {token: 'xxxxxxx'}
            }
        }
    */
    try {
        let streamConf = JSON.parse(req.app.locals.storage.getVariable(VARIABLE_CONF_STREAM) || "{}");
        res.status(200).json(streamConf)
    } catch (e) {
        console.error(e)
    }
});


router.post('/config', async (req, res, next) => {
    /*
        #swagger.tags = ['Stream']
        #swagger.summary = "Update the configuration about streaming platform"
        #swagger.parameters['conf'] = {
            in: 'body',
            description: 'Data about configuration (Only uptobox available now',
            schema: {
                $uploadEnabled: false,
                $uptobox: {token: 'xxxxxxx'}
            }
         }
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: {
                $uptobox: {token: 'xxxxxxx'}
            }
        }
    */
    try {
        let streamConf = JSON.parse(req.app.locals.storage.getVariable(VARIABLE_CONF_STREAM) || "{}");
        let upToBoxToken = req.body.uptobox && req.body.uptobox.token;
        streamConf = {
            uploadEnabled: req.body.uploadEnabled,
            uptobox: {token: upToBoxToken}
        }
        req.app.locals.storage.setVariable(VARIABLE_CONF_STREAM, JSON.stringify(streamConf));
        res.status(200).json(streamConf)
    } catch (e) {
        console.error(e)
    }
});

export default router;
