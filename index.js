const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const request = require('request')

var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 10;
https.globalAgent.maxSockets = 10;

function getURLs(url) {
    console.log('> Getting URLs ...')
    return new Promise(function(resolve, reject) {
        request(url, function(err, response, body) {
            if(err) reject(err)
            // if(response.statusCode !== 200) {
            //     reject('Invalid status code: '+response.statusCode)
            // }
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
            console.log('> Getting ' + url + ' recipe ...')
            if(err) reject(err)
            if(response.statusCode !== 200) {
                console.log(url, response.statusCode)
                // reject('Invalid status code: '+response.statusCode)
            }

            let $ = cheerio.load(body)

            function getIngredients() {
                let ingredients = []
                $('.posts > .postconts').children('ul').first().children('li').each(function(i, elem) {
                    ingredients[i] = $(this).text()
                })
                return ingredients
            }

            function getPreparation() {
                let preparation = []
                $('.posts > .postconts').children('ol').first().children('li').each(function(i, elem) {
                    preparation[i] = $(this).text()
                })
                return preparation
            }

            function getNotes() {
                let notes = []
                $('.posts > .postconts').children('ul').eq(2).children('li').each(function(i, elem) {
                    notes[i] = $(this).text()
                })
                if (notes.length) {
                    return notes
                }
            }

            function getCategories() {
                let categories = []
                $('.postmetass > .postmetas4').children('a').each(function(i, elem) {
                    categories[i] = $(this).text()
                })
                return categories
            }

            function getTags() {
                let tags = []
                $('.postmetass > .postmetas5').children('a').each(function(i, elem) {
                    tags[i] = $(this).text()
                })
                return tags
            }

            let recipe = {
                'title': $('.posts > .post_title').children('h2').text(),
                'people': $('.posts > .postconts').children('p').first().text().replace(/\(|\)/g, ''),
                'ingredients': getIngredients(),
                'time': $('.posts > .postconts').children('ul').eq(1).children('li').text(),
                'preparation': getPreparation(),
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
    if (name === undefined) {
        name = 'lala'
    } else if (typeof name !== 'string' || name instanceof String) {
        name.toString()
    }

    fs.writeFile(path.join(__dirname, '/' + name + '.json'), JSON.stringify(data, null, 4), (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log('> "' + name + '.json" has been created successfully!')
    })
}

function getAllRecipes(url) {
    console.log('> Getting all the recipes ...')
    getURLs(url)
        .then(function(urls) {
            let promises = []
            for(let i=0; i<urls.length; i++) {
                promises.push(getRecipe(urls[i]))
            }
            Promise.all(promises)
                .then(function(response){
                    console.log('> Received ' + response.length + ' recipes.')
                    createJSON(response, 'receptes 2')
                })
        })
}

getAllRecipes('http://www.hiulitscuisine.com/category/receptes/')
