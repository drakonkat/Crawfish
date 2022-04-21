import axios from "axios";
import * as cheerio from "cheerio";

export const crawlFitGirl = async (q) => {
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
                promises.push(async () => {
                    console.log("finished " + x)
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
                        games.push({
                            name: gameName,
                            // description,
                            originalSize,
                            repackSize,
                            // magnets
                        })
                    }
                    console.log("CHECK HERE: ", games)
                })
            }
        });
        await Promise.all(promises)
        console.log("Returned")
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


const parameterToFind = (texts, q) => {
    for (let text of texts) {
        if (text.includes(q)) {
            return text.substring(text.indexOf(q) + q.length, text.length);
        }
    }
}
