import axios from "axios"
import * as cheerio from 'cheerio';

class SearxFetcher {
    configuration = {
        instances: [],
        ready: false
    }


    constructor() {
        this.fetchFitGirl();
        axios.get("https://searx.space/data/instances.json").then(res => {
            console.log("Founded searx resource", true)
            let array = [];
            for (let instancesKey in res.data.instances) {
                let instance = res.data.instances[instancesKey];
                if (instance.http.grade === "A+" && instance.tls.grade === "A+" && instance.html.grade === "V" && instance.timing && !["https://search.ononoki.org/", "https://searx.tiekoetter.com/"].includes(instancesKey)) {
                    array.push({
                        ...instance,
                        url: instancesKey
                    })
                }
            }
            this.configuration.instances = array.sort((a, b) => {
                if (a.timing.search.all.median < b.timing.search.all.median) {
                    return -1;
                }
                if (a.timing.search.all.median > b.timing.search.all.median) {
                    return 1;
                }
                return 0;
            });
            this.reconfigureFetcher().catch(error => {
                console.error("Error configuring fetcher: ", error && error.message)
            });
        })
    }

    fetchFitGirl = async () => {
        console.log("CHECKING FITGIRL")
        let res = await axios.get("https://fitgirl-repacks.site/")
        let $ = cheerio.load(res.data)
        // console.log("CHECKING FITGIRL: ", $('article,.post').each((x,elem)=>console.log($(elem).attr("id"))));
        $('article,.post').each((x,elem)=> {
            console.log("CHECK:"+x,  $(elem).attr("id"))
            $(elem).find('a').each((y,elem2)=> {
                if($(elem2).text().includes("magnet"))
                console.log("CHECK:"+y,  $(elem2).attr("href"))
            })

        });


    }

    reconfigureFetcher = async () => {
        for (let i in this.configuration.instances) {
            let instance = this.configuration.instances[i]
            let instancesKey = instance.url;
            try {
                let res = await axios.get(instancesKey + "?q=2022&category_files=on&format=json");
                this.configuration.usedInstance = instance
                this.configuration.usedInstance.host = instancesKey
                this.configuration.ready = true;
                console.log("Founded source: ", instancesKey)
                break;
            } catch (e) {
                console.error("Error checking resource " + instancesKey + ": ", false)
            }

        }
    }

    search = async (q = "2022") => {
        let promise = new Promise((resolve, reject) => {
            let wait = () => {
                if (this.configuration.ready) {
                    return resolve();
                } else {
                    console.log("Still waiting: ")
                    setTimeout(wait, 2000);
                }
            }
            wait();
        });
        await promise;
        let res = await axios.get(this.configuration.usedInstance.host + "?q=" + q + "&category_files=on&format=json&engines=1337x,nyaa,yggtorrent,torrentz,solidtorrents");
        return res.data.results
    }

}

export default SearxFetcher;
