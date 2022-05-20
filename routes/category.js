const express = require("express");
const {GAMES, MOVIES, TVSHOW, GENERIC} = require("./classes/type");

const router = express.Router();


const KEY_VARIABLE_CATEGORY = "KEY_VARIABLE_CATEGORY"
const DEFAULT_CATEGORY = [
    {
        id: 1,
        type: GAMES,
        label: "Games",
        path: "./torrent/games",
        tooltip: "A curated list of repacked games",
    },
    {
        id: 2,
        type: MOVIES,
        label: "Movie",
        path: "./torrent/movies",
        tooltip: "Explore a list of movies",
    },
    {
        id: 3,
        type: TVSHOW,
        label: "Tv",
        path: "./torrent/tvshow"
    },
    {
        id: 4,
        type: GENERIC,
        label: "General",
        path: "./torrent/miscellaneous"
    }
]

const getCategory = (req) => {
    let output = req.app.locals.storage.getVariable(KEY_VARIABLE_CATEGORY)
    if (output) {
        return output
    } else {
        return DEFAULT_CATEGORY;
    }
}


router.get('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Get all the category that identify the default path for that category"
        #swagger.responses[200] = {
                description: "List of the available category",
                schema: [{
                    $id: 1
                    $type: MOVIES
                    $label: "Movies"
                    $defaultSearch: "2022"
                    $path: "./"
                    $tag: "en,1080p"
                    $Tooltip: "Here you can find interesting movies"
                }]
            }
        }
    */
    let output = getCategory(req)
    res.status(200).json(output)
});
router.post('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Create a category"
        #swagger.parameters['category'] = {
            in: 'body',
            description: 'Create a category',
            schema: {
                $id: 1
                $type: MOVIES
                $label: "Movies"
                $defaultSearch: "2022"
                $path: "./"
                $tag: "en,1080p"
                $Tooltip: "Here you can find interesting movies"
            }
         }
        #swagger.responses[200] = {
                description: "If the operation gone fine, it will return the id",
                schema: true
            }
    */

    let input = {
        id: 0,
        type: req.body.type,
        label: req.body.label,
        defaultSearch: req.body.type.defaultSearch,
        path: req.body.path,
        tag: req.body.tag,
        tooltip: req.body.tooltip
    }
    let categories = getCategory(req);
    if (categories.length > 0) {
        let isPresent = true
        while (isPresent) {
            input.id++
            isPresent = categories.map(x => x.id).includes(input.id);
        }
    }
    categories.push(input);
    req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
    res.status(200).json(input.id)
});

router.put('/:categoryId', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Edit a category, based on the id of the path"
        #swagger.parameters['category'] = {
            in: 'body',
            description: 'Edit a category',
            schema: {
                $id: 1
                $type: MOVIES
                $label: "Movies"
                $defaultSearch: "2022"
                $path: "./"
                $tag: "en,1080p"
                $Tooltip: "Here you can find interesting movies"
            }
         }
        #swagger.responses[200] = {
                description: "If the operation gone fine, true",
                schema: true
            }
    */
    let categoryId = req.params.categoryId

    let input = {
        id: categoryId,
        type: req.body.type,
        label: req.body.label,
        defaultSearch: req.body.type.defaultSearch,
        path: req.body.path,
        tag: req.body.tag,
        tooltip: req.body.tooltip
    }
    let categories = getCategory(req);
    if (categories.length > 0) {
        let index = categories.findIndex(x => x.id === categoryId)
        if (index) {
            categories[index] = input;
            req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
            res.status(200).json(true)
        } else {
            res.status(200).json(false)
        }
    } else {
        res.status(200).json(false)
    }


});

router.delete('/:categoryId', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Remove a category, based on the id in the path param"
        #swagger.responses[200] = {
                description: "If the operation gone fine return true, otherwise false",
                schema: true
            }
    */
    let categoryId = req.params.categoryId
    let categories = getCategory(req);
    if (categories.length > 0) {
        let index = categories.findIndex(x => x.id === categoryId)
        if (index) {
            categories.splice(index, 1);
            req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
            res.status(200).json(true)
        } else {
            res.status(200).json(false)
        }
    } else {
        res.status(200).json(false)
    }
    res.status(200).json(true)
});

module.exports = router;
