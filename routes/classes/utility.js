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
            }
        })
    }
}

module.exports = {mapTorrent}
