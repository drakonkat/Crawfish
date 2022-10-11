const fs = require('fs')
const {XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');
const mime = require('mime-types')

const mapTorrent = (x) => {
    let progress;
    let lengthFile = x.files.reduce((total, file) => {
        return total + file.length;
    }, 0);
    if (x.files && x.files.length > 0) {
        progress = x.files.reduce((total, file) => {
            if (file.paused) {
                return total + file.length;
            } else {
                return total + (file.progress * file.length);
            }
        }, 0) / lengthFile
    } else {
        progress = x.progress
    }
    return {
        size: x.files && x.files.reduce((total, file) => {
            return total + file.length;
        }, 0),
        name: x.name,
        infoHash: x.infoHash,
        magnet: x.magnetURI || x.magnet,
        downloaded: x.downloaded,
        uploaded: x.uploaded,
        downloadSpeed: x.downloadSpeed,
        uploadSpeed: x.uploadSpeed,
        progress: progress,
        ratio: x.ratio,
        path: x.path,
        done: x.done,
        length: x.length,
        paused: x.paused,
        timeRemaining: x.timeRemaining,
        received: x.received,
        files: x.files && x.files.map(y => {
            return {
                name: y.name,
                length: y.length,
                path: y.path,
                paused: y.paused || false,
                progress: y.progress,
                streamable: supportedFormats.includes(getExtension(y.name)),
                done: y.progress >= 1,
                mime: mime.lookup(y.name)
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


function writeFileSyncRecursive(filename, content = "", charset) {
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
    return;
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


const stringToDate = (string) => {
    if (string instanceof Date) {
        return string;
    } else if (string) {
        let d = new Date();
        let [hours, minutes] = string.split(':');
        console.log("Check converting: ", string, hours, minutes)
        d.setHours(hours);
        d.setMinutes(minutes);
        console.log("Check converting2: ", d.toLocaleTimeString())
        return d;
    } else {
        return null;
    }
}

async function deselectFileFromTorrent(temp, db, fileName = "") {
    let t = mapTorrent(temp);
    let foundedTorrent;
    try {
        foundedTorrent = await db.get(TORRENTS_KEY + t.infoHash);
    } catch (e) {
        console.warn("TORRENT NOT EXISTING BEFORE")
    }
    if (foundedTorrent) {
        foundedTorrent = {
            ...t,
            files: t.files.map(f => {
                if (f.name === fileName || foundedTorrent.files.find(x => f.name === x.name).paused) {
                    f.paused = true;
                }
                return f
            }),
            _rev: foundedTorrent._rev,
            _id: TORRENTS_KEY + t.infoHash
        };
        db.put(foundedTorrent)
    } else {
        await db.put({
            ...t,
            files: t.files.map(f => {
                if (f.name === fileName) {
                    f.paused = true;
                }
                return f
            }),
            _id: TORRENTS_KEY + t.infoHash
        })
    }

    temp.deselect(0, temp.pieces.length - 1, false)
    for (let i = 0; i < temp.files.length; i++) {
        let f = temp.files[i]
        let fStored = foundedTorrent.files[i]
        if (!fStored.paused) {
            f.select()
        } else {
            f.deselect()
        }
    }
}


async function selectFileFromTorrent(temp, db, fileName = "") {
    let t = mapTorrent(temp);
    let foundedTorrent;
    try {
        foundedTorrent = await db.get(TORRENTS_KEY + t.infoHash);
    } catch (e) {
        console.warn("TORRENT NOT EXISTING BEFORE")
    }
    if (foundedTorrent) {
        foundedTorrent = {
            ...t,
            files: t.files.map(f => {
                if (foundedTorrent.files.find(x => f.name === x.name).paused) {
                    f.paused = true;
                }
                if (f.name === fileName) {
                    f.paused = false;
                }
                return f
            }),
            _rev: foundedTorrent._rev,
            _id: TORRENTS_KEY + t.infoHash
        };
        db.put(foundedTorrent)
    } else {
        await db.put({
            ...t,
            files: t.files.map(f => {
                if (f.name === fileName) {
                    f.paused = false;
                }
                return f
            }),
            _id: TORRENTS_KEY + t.infoHash
        })
    }

    temp.deselect(0, temp.pieces.length - 1, false)
    for (let i = 0; i < temp.files.length; i++) {
        let f = temp.files[i]
        let fStored = foundedTorrent.files[i]
        if (!fStored.paused) {
            f.select()
        } else {
            f.deselect()
        }
    }
}

module.exports = {
    mapTorrent,
    TORRENTS_KEY,
    getExtension,
    supportedFormats,
    simpleHash,
    writeFileSyncRecursive,
    parseTorznabResult,
    stringToDate,
    deselectFileFromTorrent,
    selectFileFromTorrent
}
