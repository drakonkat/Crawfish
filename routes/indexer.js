const express = require("express");
const {
    crawlFitGirl,
    crawlTvShow1337x,
    crawlMovies1337x,
    crawlGames1337x,
    jackettCrawl,
    categories
} = require("./classes/indexers");
const {
    MOVIES,
    GAMES,
    TVSHOW,
    FITGIRL,
    GENERIC,
    MUSIC,
    SEARX,
    _1337x,
    BOOK,
    ANIME,
    XXX,
    NYAASI, RARBG
} = require("./classes/type");
const router = express.Router();

const filterIndexing = (elem) => {
    return elem.magnet;
}

const parseIndexing = (elem) => {
    return {
        name: elem.title || elem.name,
        description: elem.description || elem.guid || elem.url,
        seeders: elem.seeders || elem.seed,
        peers: elem.peers || elem.leech,
        size: elem.size || elem.filesize || elem.originalSize,
        repackSize: elem.repackSize,
        magnet: elem.magnet || elem.magneturl || elem.magnetlink || elem.link || (elem.magnets && elem.magnets[0]),
        magnets: elem.magnets
    }
}

router.get('/:source', async (req, res, next) => {
    /*
        #swagger.tags = ['indexer']
        #swagger.summary = "Based on the source will make a research on the defined indexers then remap it to a standard format (Not all the value can be populated)"
        #swagger.responses[200] = {
        description: "Configuration data",
        schema: [{
		"name": "Cyberpunk 2077",
		"description": "An intresting DRM-free game yeah",
		"seeders": "91",
		"peers": "910",
		"size": "42.2 GB",
        "repackSize": " = require( 17.2 GB [Selective Download]",
		"magnet": "magnet:...",
		"magnets": ["magnet:...","magnet:..."]
        }
    */
    try {
        let source = req.params.source
        let q = req && req.query && req.query.q
        let results;
        switch (source) {
            case RARBG:
                results = (await jackettCrawl(categories.rarbg.name, null, q));
                break;
            case ANIME:
                results = (await jackettCrawl(categories.nyaasi.name, categories.nyaasi.anime, q));
                break;
            case BOOK:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.book, q));
                break;
            case XXX:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.xxx, q));
                break;
            case NYAASI:
                results = (await jackettCrawl(categories.nyaasi.name, null, q));
                break;
            case _1337x:
            case GENERIC:
                results = (await jackettCrawl(categories._1337x.name, null, q));
                break;
            case SEARX:
                results = (await req.app.locals.searx.search(req && req.query && req.query.q));
                break;
            case MUSIC:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.music, q));
                break;
            case MOVIES:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.movies, q));
                break;
            case TVSHOW:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.tvShow, q));
                break;
            case GAMES:
                results = (await jackettCrawl(categories._1337x.name, categories._1337x.games, q));
                break;
            case FITGIRL:
            default:
                results = (await crawlFitGirl(q))
                break;
        }
        res.status(200).json(results.map(parseIndexing).filter(filterIndexing))
    } catch (e) {
        console.error(e)
    }
});
router.get('/', (req, res, next) => {
    /*
        #swagger.tags = ['indexer']
        #swagger.summary = "Return the list of the supported indexer"
        #swagger.responses[200] = {
        description: "Indexer list",
        schema: ["MOVIES","GAMES","TVSHOW"]
    */
    try {
        res.status(200).json([MOVIES, GAMES, TVSHOW, FITGIRL, GENERIC, MUSIC, SEARX, _1337x, BOOK, ANIME, XXX, NYAASI, RARBG])
    } catch (e) {
        console.error(e)
    }
});

module.exports = router;
