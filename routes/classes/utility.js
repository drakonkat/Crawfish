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
            }
        })
    }
}
const TORRENTS_KEY = "torrent";
const getExtension = (fileName)=>{
    return fileName.substring(fileName.lastIndexOf('.') + 1);
};
const supportedFormats = ["mp4", "webm", "m4v","jpg", "gif", "png","m4a", "mp3", "wav"]
const simpleHash = (id,filename)=>{
    return id + " - " + filename;
};
module.exports = {mapTorrent,TORRENTS_KEY,getExtension,supportedFormats, simpleHash}
