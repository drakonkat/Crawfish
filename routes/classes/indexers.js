const cheerio = require("cheerio");
const axios = require("axios");
const {parseTorznabResult} = require("./utility");


const API_KEY = "uyxwnibswpogk8vmjyle9diqb6m7o82u";
const categories = {
    _1337x: {
        name: "1337x",
        tvShow: "5000,5030,5040,5070,5080,100005,100006,100007,100009,100041,100071,100074,100075",
        movies: "2000,2010,2030,2040,2045,2060,2070,100001,100002,100003,100004,100042,100054,100055,100066,100070,100073,100076",
        games: "4050,100010,100011,100012,100013,100014,100015,100016,100017,100043,100044,100045,100046,100067,100072,100077,100082",
        music: "100022,100023,100024,100025,100026,100027,100053,100058,100059,100060,100068,100069",
        xxx: "6000,6010,6060,100048,100049,100050,100051,100067",
        book: "3030,7000,7020,7030,100036,100039,100052"
    },
    nyaasi: {
        name: "nyaasi",
        anime: "5000,5070,125996,134634,140679"
    },
    rarbg: {
        name: "rarbg"
    }
}


const crawlFitGirl = async (q) => {
    let games = [];
    let link = "https://fitgirl-repacks.site"
    if (q) {
        link = "https://fitgirl-repacks.site/?s=" + q
    }
    let res = await axios.get(link)
    let $ = cheerio.load(res.data)
    if (q) {
        let promises = [];
        $('.category-lossless-repack').each(async (x, elem) => {
            let linkDetailArticle;
            $(elem).find('a').each((y, elem2) => {
                if ($(elem2).text().includes("Continue reading")) {
                    linkDetailArticle = $(elem2).attr("href");
                }
            })
            if (linkDetailArticle) {
                promises.push((async () => {
                    console.log(x + " finished. Link: " + linkDetailArticle)
                    let res = await axios.get(linkDetailArticle)
                    let $ = cheerio.load(res.data)
                    let gameName = $('.entry-title').text()

                    let description = $('.su-spoiler-content').text()
                    let magnets = [];
                    $('a').each((y, elem2) => {
                        if ($(elem2).text().includes("magnet")) {
                            magnets.push($(elem2).attr("href"));
                        }
                    })
                    let originalSize = null;
                    let repackSize = null;
                    $('p').each((y, elem2) => {
                        let texts = $(elem2).text().split("\n");
                        let os = parameterToFind(texts, "Original Size: ")
                        let rs = parameterToFind(texts, "Repack Size: ")
                        if (os || rs) {
                            originalSize = os;
                            repackSize = rs;
                        }
                    })

                    if (magnets.length > 0) {
                        games.splice(x, 0, {
                            name: gameName,
                            description,
                            originalSize,
                            repackSize,
                            magnets
                        })
                    }
                })())
            }
        });
        await Promise.all(promises)
        return games;
    } else {
        $('.category-lossless-repack').each((x, elem) => {
            let magnets = [];
            $(elem).find('a').each((y, elem2) => {
                if ($(elem2).text().includes("magnet")) {
                    magnets.push($(elem2).attr("href"));
                }
            })
            let originalSize = null;
            let repackSize = null;
            $(elem).find('p').each((y, elem2) => {
                let texts = $(elem2).text().split("\n");
                let os = parameterToFind(texts, "Original Size: ")
                let rs = parameterToFind(texts, "Repack Size: ")
                if (os || rs) {
                    originalSize = os;
                    repackSize = rs;
                }
            })

            let gameName = $(elem).find('h1,.entry-title').text()
            let description = $(elem).find('.su-spoiler-content').text()
            if (magnets.length > -1) {
                games.push({
                    name: gameName,
                    description,
                    originalSize,
                    repackSize,
                    magnets
                })
            }
        });
        return games;
    }
}

const crawlMovies1337x = async (q) => {
    let cat = categories._1337x.movies
    let result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/1337x/results/torznab/?apikey=" + API_KEY + "&t=movie&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers&cat=" + cat)
    return parseTorznabResult(result.data);
}


const crawlTvShow1337x = async (q) => {
    let cat = categories._1337x.tvShow
    let result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/1337x/results/torznab/?apikey=" + API_KEY + "&t=tvsearch&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers&cat=" + cat)
    return parseTorznabResult(result.data);
}

const crawlGames1337x = async (q) => {
    let cat = categories._1337x.games
    let result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/1337x/results/torznab/?apikey=" + API_KEY + "&t=tvsearch&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers&cat=" + cat)
    return parseTorznabResult(result.data);
}

const crawlMusic1337x = async (q) => {
    let cat = categories._1337x.music
    let result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/1337x/results/torznab/?apikey=" + API_KEY + "&t=tvsearch&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers&cat=" + cat)
    return parseTorznabResult(result.data);
}

const jackettCrawl = async (name, cat, q) => {
    let result
    if (cat) {
        result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/" + name + "/results/torznab/?apikey=" + API_KEY + "&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers&cat=" + cat)
    } else {
        result = await axios.get("https://jackett-racknerd.tnl.one/api/v2.0/indexers/" + name + "/results/torznab/?apikey=" + API_KEY + "&q=" + q + "&attrs=poster,magneturl,language,infohash,leechers");
    }
    return parseTorznabResult(result.data);
}

const parameterToFind = (texts, q) => {
    for (let text of texts) {
        if (text.includes(q)) {
            return text.substring(text.indexOf(q) + q.length, text.length);
        }
    }
}

module.exports = {
    crawlFitGirl,
    crawlMovies1337x,
    crawlTvShow1337x,
    crawlGames1337x,
    crawlMusic1337x,
    categories,
    jackettCrawl
}
