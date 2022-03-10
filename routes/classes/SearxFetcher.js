const fs = require('fs');
const WebTorrent = require('webtorrent-hybrid');
const {mapTorrent} = require("./utility");
const axios = require("axios");
const TORRENTS_KEY = "torrent";

class SearxFetcher {
    configuration = {
        instances: []
    }


    constructor() {
        axios.get("https://searx.space/data/instances.json").then(res => {
            this.configuration.instances = res.data.instances;
            this.reconfigureFetcher().catch(error => {
                console.error("Error configuring fetcher: ", error && error.message)
            });
        })
    }

    reconfigureFetcher = async () => {
        for (let instancesKey in this.configuration.instances) {
            let instance = this.configuration.instances[instancesKey]
            if (instance.http.grade == "A+" && instance.tls.grade == "A+" && instance.html.grade == "V") {
                try {
                    let res = await axios.get(instancesKey + "?q=2022&category_files=on&format=json");
                    this.configuration.usedInstance = instance
                    this.configuration.usedInstance.host = instancesKey
                    console.log("CHECK IF PASSING HERE: ", instancesKey)
                    break;
                } catch (e) {
                    console.error("Error checking resource " + instancesKey + ": ", false)
                }
            }
        }
    }

    search = async (q = "2022") => {
        let res = await axios.get(this.configuration.usedInstance.host + "?q=" + q + "&category_files=on&format=json&engines=nyaa,1337x,kickass,piratebay,torrentz,yggtorrent");
        return res.data.results
    }

}

module.exports = SearxFetcher;
