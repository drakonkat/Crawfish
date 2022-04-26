const axios = require("axios");
const os = require('os');
const pjson = require('../../package.json');
const fs = require("fs");
const path = require("path");

const platform = os.platform();

const isToUpdate = async () => {
    let toUpdate = false;
    let version = pjson.version.match(/\d+/g).join("");
    let link = "https://api.github.com/repos/drakonkat/webtorrent-express-api/releases";
    let res = await axios.get(link)
    for (let release of res.data) {
        let remoteVersion = release.tag_name.match(/\d+/g).join("")
        toUpdate = remoteVersion > version
    }
    if(toUpdate){
        downloadNewRelease()
    }
    return toUpdate;
}

async function downloadNewRelease(url = "https://github.com/drakonkat/webtorrent-express-api/releases/download/v1.5.1-alpha/CrawFish.Setup.1.5.1.exe") {
    try {
        console.log('Connecting …')
        let {data, headers} = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        })
        let totalLength = headers['content-length']

        console.log('Starting download ' + totalLength)

        let writer = fs.createWriteStream("./asbjkdkasndsa.exe")

        let progress = 0
        data.on('data', (chunk) => {
            progress +=chunk.length
            console.log("Progress: " + progress + "/" + totalLength)
        })
        data.pipe(writer)
    }catch (e) {
        console.error("Error: ",e)

    }
}


const parameterToFind = (texts, q) => {
    for (let text of texts) {
        if (text.includes(q)) {
            return text.substring(text.indexOf(q) + q.length, text.length);
        }
    }
}

module.exports = {isToUpdate,downloadNewRelease}
