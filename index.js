const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const request = require('request')

var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 20;
https.globalAgent.maxSockets = 20;

const srcURL = 'https://www.hiulitscuisine.com/category/receptes/'
const destPath = '/src/data/includes/'

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]
        var y = b[key]
        if (typeof x == "string") {
            x = (""+x).toLowerCase()
        }
        if (typeof y == "string") {
            y = (""+y).toLowerCase()
        }
        return ((x < y) ? -1 : ((x > y) ? 1 : 0))
    })
}

function getURLs(url) {
    console.log('> Getting URLs ...')
    return new Promise(function(resolve, reject) {
        request(url, function(err, response, body) {
            if(err) reject(err)
            if(response.statusCode !== 200) {
                reject('Invalid status code: '+response.statusCode)
            }
            let $ = cheerio.load(body)
            let urls = []

            $('.rptitle-cat').each(function (i, elem) {
                let href = $(elem).find('h3 > a').attr('href')
                urls.push(href)
            })

            resolve(urls)
        })
    })
}

function getRecipe(url) {
    return new Promise(function(resolve, reject) {
        let options = {
            uri: url,
            headers: {
                'Host': 'www.hiulitscuisine.com'
            }
        }
        request(options, function(err, response, body) {
            console.log('> Getting ' + url)
            if(err) reject(err)
            if(response.statusCode !== 200) {
                console.log('ERROR:', url, response.statusCode)
                reject('ERROR:', url, response.statusCode)
            }

            let $ = cheerio.load(body)

            function getImage() {
                let image
                image = $('.postthumb img').attr('src')
                if (image) {
                    return image
                }
            }

            function getBlockquote() {
                let blockquote = []
                $('.posts > .postconts').children('blockquote').contents().each(function(i, elem) {
                    if ($(this).is('p')) {
                        blockquote.push($(this).text())
                    }
                    if ($(this).is('ul')) {
                        $(this).children('li').each(function(i, elem) {
                            blockquote.push($(this).text())
                        })
                    }
                })
                if (blockquote.length) {
                    return blockquote
                }
            }

            function getPeople() {
                let people
                $('.posts > .postconts').children('h3').each(function(i, elem) {
                    if ($(this).text() === 'Ingredients:' || $(this).text() === 'Ingredients') {
                        people = $(this).next('p').text().replace(/\(|\)/g, '')
                        people = people.replace(/per a/, '')
                    }
                })
                if (people) {
                    return people
                }
            }

            function getIngredients() {
                let ingredientsList = []
                let ingredients = []
                $('.posts > .postconts').children('h3').each(function(i, elem) {
                    if ($(this).text() === 'Temps de preparació:' || $(this).text() === 'Temps de preparació') {

                        $(this).prevAll('ul').each(function(i, elem) {
                            ingredientsList.push($(this))
                        })

                        ingredientsList.reverse()

                        $(ingredientsList).each(function(i, elem) {
                            $(this).children('li').each(function(i, elem) {
                                ingredients.push($(this).text())
                            })
                        })
                    }
                })
                if (ingredients.length) {
                    return ingredients
                }
            }

            function getTime() {
                let time = []
                $('.posts > .postconts').children('h3').each(function(i, elem) {
                    if ($(this).text() === 'Temps de preparació:' || $(this).text() === 'Temps de preparació') {
                        $(this).next('ul').children('li').each(function(i, elem) {
                            time.push($(this).text())
                        })
                    }
                })
                if (time.length) {
                    return time
                }
            }

            function getPreparation() {
                let preparation = []
                $('.posts > .postconts').children('h3').each(function(i, elem) {
                    if ($(this).text() === 'Preparació:' || $(this).text() === 'Preparació') {
                        $(this).next('ol').children('li').each(function(i, elem) {
                            preparation.push($(this).text())
                        })
                    }

                })
                if (preparation.length) {
                    return preparation
                }
            }

            function getPresentation() {
                let presentation = []
                $('.posts > .postconts').children('h3').each(function(i, elem) {
                    if ($(this).text() === 'Presentació:' || $(this).text() === 'Presentació') {
                        $(this).next('ul').children('li').each(function(i, elem) {
                            presentation.push($(this).text())
                        })
                    }
                })
                if (presentation.length) {
                    return presentation
                }
            }

            function getNotes() {
                let notes = []
                $('.posts > .postconts').children('h4').each(function(i, elem) {
                    if ($(this).text() === 'Nota:'  || $(this).text() === 'Nota' || $(this).text() === 'Notes:' || $(this).text() === 'Notes') {
                        $(this).next('ul').children('li').each(function(i, elem) {
                            notes.push($(this).text())
                        })
                    }
                })
                if (notes.length) {
                    return notes
                }
            }

            function getCategories() {
                let categories = []
                $('.postmetass > .postmetas4').children('a').each(function(i, elem) {
                    categories.push($(this).text())
                })
                if (categories.length) {
                    return categories
                }
            }

            function getTags() {
                let tags = []
                $('.postmetass > .postmetas5').children('a').each(function(i, elem) {
                    tags.push($(this).text())
                })
                if (tags.length) {
                    return tags
                }
            }

            let recipe = {
                'image': getImage(),
                'blockquote': getBlockquote(),
                'title': $('.posts > .post_title').children('h2').text(),
                'people':  getPeople(),
                'ingredients': getIngredients(),
                'time': getTime(),
                'preparation': getPreparation(),
                'presentation': getPresentation(),
                'notes': getNotes(),
                'video': $('.posts > .postconts').find('iframe').attr('src'),
                'categories': getCategories(),
                'tags': getTags()
            }

            resolve(recipe)
        })
    })
}

function createJSON(data, name) {
    if (name === '' || name === undefined) {
        throw new Error('Function needs a name (string) as a second parameter!')
    } else if (typeof name !== 'string' || name instanceof String) {
        name.toString()
    }

    fs.writeFile(path.join(__dirname, destPath + name + '.json'), JSON.stringify(data, null, 4), (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log('> "'+ destPath + name + '.json" has been created successfully!')
    })
}

function getAllRecipes(url) {
    console.log('> Getting all the recipes ...')
    getURLs(url)
        .then(function(urls) {
            let promises = []
            for(let i = 0; i < urls.length; i++) {
                promises.push(getRecipe(urls[i]))
            }
            Promise.all(promises)
                .then(function(response){
                    console.log('> Received ' + response.length + ' recipes.')

                    // Recipes
                    let recipes = sortByKey(response, 'title')
                    createJSON(recipes, 'recipes')

                    // Categories
                    let categories = []
                    let categoriesArray = []
                    for(let i = 0; i < response.length; i++) {
                        for(let j = 0; j < response[i].categories.length; j++) {
                            if (!categoriesArray.includes(response[i].categories[j])) {
                                categoriesArray.push(response[i].categories[j])
                                categories.push({
                                    id: response[i].categories[j],
                                    recipes: []
                                })
                            }
                            for (let k = 0; k < categories.length; k++) {
                                if (categories[k].id === response[i].categories[j]) {
                                    categories[k].recipes.push(response[i])
                                }
                            }
                        }
                    }
                    categories = sortByKey(categories, 'id')
                    createJSON(categories, 'categories')

                    // Tags
                    let tags = []
                    let tagsArray = []
                    for(let i = 0; i < response.length; i++) {
                        for(let j = 0; j < response[i].tags.length; j++) {
                            if (!tagsArray.includes(response[i].tags[j])) {
                                tagsArray.push(response[i].tags[j])
                                tags.push({
                                    id: response[i].tags[j],
                                    recipes: []
                                })
                            }
                            for (let k = 0; k < tags.length; k++) {
                                if (tags[k].id === response[i].tags[j]) {
                                    tags[k].recipes.push(response[i])
                                }
                            }
                        }
                    }
                    tags = sortByKey(tags, 'id')
                    createJSON(tags, 'tags')
                })
                .catch(function(e) {
                    console.log(e)
                })
        })
}

getAllRecipes(srcURL)
