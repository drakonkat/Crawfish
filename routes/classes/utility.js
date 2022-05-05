const fs = require('fs')
const {XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');

const mapTorrent = (x) => {
    return {
        name: x.name,
        infoHash: x.infoHash,
        magnet: x.magnetURI,
        downloaded: x.downloaded,
        uploaded: x.uploaded,
        downloadSpeed: x.downloadSpeed,
        uploadSpeed: x.uploadSpeed,
        progress: x.progress,
        ratio: x.ratio,
        path: x.path,
        done: x.done,
        paused: x.paused,
        timeRemaining: x.timeRemaining,
        received: x.received,
        files: x.files && x.files.map(y => {
            return {
                name: y.name,
                length: y.length,
                path: y.path,
                progress: y.progress,
                streamable: supportedFormats.includes(getExtension(y.name)),
                done: y.progress >= 1
            }
        })
    }
}
const TORRENTS_KEY = "torrent";
const getExtension = (fileName) => {
    return fileName.substring(fileName.lastIndexOf('.') + 1);
};
const supportedFormats = ["mp4", "webm", "m4v", "jpg", "gif", "png", "m4a", "mp3", "wav"]
const simpleHash = (id, filename) => {
    return id + " - " + filename;
};


function writeFileSyncRecursive(filename, content, charset) {
    // -- normalize path separator to '/' instead of path.sep,
    // -- as / works in node for Windows as well, and mixed \\ and / can appear in the path
    let filepath = filename.replace(/\\/g, '/');

    // -- preparation to allow absolute paths as well
    let root = '';
    if (filepath[0] === '/') {
        root = '/';
        filepath = filepath.slice(1);
    } else if (filepath[1] === ':') {
        root = filepath.slice(0, 3);   // c:\
        filepath = filepath.slice(3);
    }

    // -- create folders all the way down
    const folders = filepath.split('/').slice(0, -1);  // remove last item, file
    folders.reduce(
        (acc, folder) => {
            const folderPath = acc + folder + '/';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath
        },
        root // first 'acc', important
    );

    // -- write file
    fs.writeFileSync(root + filepath, content, charset);
}

const parseTorznabResult = (data) => {
    const xmlParser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        // attributesGroupName: "group_",
        parseAttributeValue: true,
        removeNSPrefix: true
    });
    let result = xmlParser.parse(data);
    let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed;
    if (Array.isArray(channel)) {
        channel = channel[0];
    }


    let items = channel.item;
    if (items && !Array.isArray(items)) {
        items = [items];
    } else if (!items) {
        items = []
    }


    for (let i = 0; i < items.length; i++) {
        let val = items[i];
        for (let elem of val.attr) {
            if (val[elem.name] && !Array.isArray(val[elem.name])) {
                val[elem.name] = [val[elem.name], elem.value]
            } else if (val[elem.name] && Array.isArray(val[elem.name])) {
                val[elem.name].push(elem.value);
            } else {
                val[elem.name] = elem.value
            }
        }
        items[i] = val;
    }
    delete items.attr;
    return items;
};


module.exports = {
    mapTorrent,
    TORRENTS_KEY,
    getExtension,
    supportedFormats,
    simpleHash,
    writeFileSyncRecursive,
    parseTorznabResult
}
