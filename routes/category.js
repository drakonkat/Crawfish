const express = require("express");
const {GAMES, MOVIES, TVSHOW, GENERIC, FITGIRL} = require("./classes/type");
const path = require("path");

const router = express.Router();


const KEY_VARIABLE_CATEGORY = "KEY_VARIABLE_CATEGORY"
const DEFAULT_CATEGORY = (downloadPath) => [
    {
        id: 1,
        type: GAMES,
        label: "Games",
        path: path.join(downloadPath, "games"),
        tooltip: "A curated list of repacked games",
        tag: "",
        defaultSearch: "repack",
    },
    {
        id: 2,
        type: MOVIES,
        label: "Movie",
        path: path.join(downloadPath, "movies"),
        tooltip: "Explore a list of movies",
        tag: undefined,
        defaultSearch: "2022",
    },
    {
        id: 3,
        type: MOVIES,
        label: "Movie 1080p",
        path: path.join(downloadPath, "movies_HD"),
        tooltip: "Explore a list of movies (filtered in 1080p)",
        tag: "1080",
        defaultSearch: "2022",
    },
    {
        id: 4,
        type: TVSHOW,
        label: "Tv",
        path: path.join(downloadPath, "tvshow"),
        tag: undefined,
        defaultSearch: "2022",
    },
    {
        id: 5,
        type: GENERIC,
        label: "General",
        path: path.join(downloadPath, "miscellaneous"),
        tag: undefined,
        defaultSearch: "2022",
    },
    {
        id: 6,
        type: FITGIRL,
        label: "FitGirl",
        path: path.join(downloadPath, "games"),
    }

]

const getCategory = (req) => {
    let output = req.app.locals.storage.getVariable(KEY_VARIABLE_CATEGORY)
    if (output) {
        return output
    } else {
        return DEFAULT_CATEGORY(req.app.locals.storage.configuration.downloadPath);
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
        path: req.body.path || req.app.locals.storage.configuration.downloadPath,
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
    await req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
    res.status(200).json(input.id)
});
router.patch('/', async (req, res, next) => {
    /*
        #swagger.tags = ['Category']
        #swagger.summary = "Restore the default category"
        #swagger.responses[200] = {
                description: "If the operation gone fine, it will return the id",
                schema: true
            }
    */
    await req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, DEFAULT_CATEGORY(req.app.locals.storage.configuration.downloadPath));
    res.status(200).json(true)
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
        id: parseInt(categoryId),
        type: req.body.type,
        label: req.body.label,
        defaultSearch: req.body.defaultSearch,
        path: req.body.path,
        tag: req.body.tag,
        tooltip: req.body.tooltip
    }
    let categories = getCategory(req);
    if (categories.length > 0) {
        let index = categories.findIndex(x => x.id == categoryId)
        console.log("SAVED DATA:", categoryId, index)
        if (index !== -1) {
            categories[index] = input;
            await req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
            let output = req.app.locals.storage.getVariable(KEY_VARIABLE_CATEGORY)
            console.log("RETRIEVED DATA:", output)
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
        let index = categories.findIndex(x => x.id == categoryId)
        if (index !== -1) {
            categories.splice(index, 1);
            await req.app.locals.storage.setVariable(KEY_VARIABLE_CATEGORY, categories);
            res.status(200).json(true)

        } else {
            res.status(200).json(false)

        }
    } else {
        res.status(200).json(false)

    }
});

module.exports = router;
