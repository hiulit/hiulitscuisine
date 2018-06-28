function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
      return false
    }
    let arr1 = _arr1.concat().sort()
    let arr2 = _arr2.concat().sort()
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]){
            return false
        }
    }
    return true
}

function arrayContainsArray(superset, subset) {
    if (0 === subset.length) {
        return false
    }
    return subset.every(function (value) {
        // console.log(superset)
        // console.log(superset.indexOf(value))
        // console.log(value)
        // lala[value] = lala[value] || []
        // lala[value].push(superset.indexOf(value))
        return (superset.indexOf(value) >= 0)
    })
}

function arrayContainsArrayOrMore(superset, subset) {
    let array = []
    if (0 === subset.length) {
        return false
    }
    for (let i = 0; i < subset.length; i++) {
        console.log(superset.indexOf(subset[i]))
        if(superset.includes(subset[i])) {
            array.push(subset[i])
        }
    }
    return array
    if (array.length) {
        return true
    } else {
        return false
    }
}

function arrayContainsAny(source, target) {
    let result = source.filter((item) => target.indexOf(item) > -1)
    return (result.length > 0);
}

function arraysCommon(arrays) {
    let result = arrays.shift().reduce(function(res, v) {
        if (res.indexOf(v) === -1 && arrays.every(function(a) {
            return a.indexOf(v) !== -1;
        })) res.push(v);
        return res;
    }, []);
    console.log(result)
    return result
}





function concatArrays(arrays){
  return [].concat.apply([], arrays)
}

function findDuplicateInArray(array) {
    return array.filter((a, i, aa) => aa.indexOf(a) === i && aa.lastIndexOf(a) !== i)
}

// var arrays  = [
//     ["Amanida d’arròs i algues amb veganesa", "Arròs a la cubana", "Arròs amb bolets", "Arròs de diumenge", "Arròs negre vegà (sense tinta de calamar) amb allioli", "Filets de tofu amb curri", "Makis d’alvocat i tomàquet", "Paella vegana"],
//     ["Albergínies farcides", "Amanida d’arròs i algues amb veganesa", "Arròs a la cubana", "Arròs negre vegà (sense tinta de calamar) amb allioli", "Cassoleta de tempeh", "Coliflor i patata amb beixamel vegana gratinada", "Crema de carbassa", "Crema de carbassó", "Crema de pastanaga amb curri i llet de coco", "Croquetes d’espinacs i pinyons", "Cuscús de verdures i seitan", "Escalivada", "Espaguetis a la puttanesca", "Espaguetis amb beixamel vegana d’espinacs", "Estofat de llenties", "Filets de tofu amb curri", "Fricandó de seitan", "Gaspatxo", "Guacamole", "Hamburgueses de civada i bolets xiitake", "Hamburgueses de pastanaga i patata", "Mandonguilles de seitan", "Moniatos al forn amb anelles de ceba", "Pasta a la carbonara vegana", "Pasta amb salsa de tomàquet i pastanaga", "Seitan amb salsa d’ametlles", "Sopa de ceba", "Truita de patates vegana", "Vichyssoise (crema de porro)"],
//     ["Arròs a la cubana", "Batut de fruites i espinacs", "Gelatina de fruites d’agar-agar", "Muffins de plàtan", "Plàtan amb melmelada de maduixa"],
//     ["Orxata"]
// ]

// var concatItems = concatArrays(arrays)
// var duplicateItems = findDuplicateInArray(concatItems)
// console.log(duplicateItems)

let ingredients = ['arròs', 'ceba', 'plàtan', 'xufa']

function compare(arr1, arr2) {
    return Math.round((arr1.length / arr2.length) * 100)
}
// common = Tots els ingedients que coincideixen entre la recepta i la cerca.
// outLeft = Tots les ingredients que falten.
// outRight = Tots els ingredients que sobren.
// outLeft + common = Tots els ingredients de la recepta.
// ourRight + common = Tots els ingredients de la cerca.
// compare1 = Percentage d'ingredients que són presents a la recepta (si hi ha 100%, tens tots els ingredients per a fer la recepta)
// compare2 = Percentage d'ingredients que són presents a la cerca (si hi ha 100%, tens més ingredients, o no, dels que necessites per a fer la recepta)
$.ajax({
    dataType: "json",
    url: 'https://raw.githubusercontent.com/hiulit/hiulitscuisine/master/src/data/includes/recipes.json',
    success: function(recipes) {
        let results = []
        for (let recipe of recipes) {
            let common = []
            let outLeft = []
            let outRight = []
            for (let tag of recipe.tags) {
                if (ingredients.indexOf(tag) >= 0) {
                    common.push(tag)
                } else {
                    outLeft.push(tag)
                }
            }
            for (let ingredient of ingredients) {
                if (common.indexOf(ingredient) == -1) {
                    outRight.push(ingredient)
                }
            }
            let result = [outLeft, common, outRight, compare(common, recipe.tags), compare(common, ingredients)]
            result.title = recipe.title
            results.push(result)


        }
        console.log(results.sort((a, b) => { return b[3] - a[3]}))
    },
    error: function(err) {
        console.log(err)
    }
})













let ajax = new XMLHttpRequest()
ajax.open("GET", "https://raw.githubusercontent.com/hiulit/hiulitscuisine/master/src/data/includes/tags.json", true)
ajax.onload = function() {
    let list = JSON.parse(ajax.responseText).map((item) => item.id)
    new Awesomplete(document.querySelector("#search-input"),
        {
            list: list,
            filter: function(text, input) {
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0])
            },
            item: function(text, input) {
                return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0])
            },
            replace: function(text) {
                let before = this.input.value.match(/^.+,\s*|/)[0]
                this.input.value = before + text + ", "
            }
        }
    )
}
ajax.send()


$('#search-submit').click(function(e) {
    e.preventDefault()
    if (!$('#search-input').val()) {
        console.log('empty')
    } else {
        let strictMode = false
        let string = $('#search-input').val()
        let ingredients = string.split(',').map((item) => item.trim()).filter((item) => item !== (undefined || null || ''))
        $('#search-mode-fieldset').find('input[type="radio"]').each(function() {
            if ($(this).is(':checked')) {
                console.log($(this).attr('id'), 'checked')
                if ($(this).attr('id') === 'strict-mode') {
                    $.ajax({
                        dataType: "json",
                        url: 'https://raw.githubusercontent.com/hiulit/hiulitscuisine/master/src/data/includes/recipes.json',
                        success: function(response) {
                            let strictObject = {}
                            let strictArray = []
                            for (let i = 0; i < response.length; i++) {
                                // if (arraysEqual(ingredients, response[i].tags)) {
                                //     strictArray.push(response[i])
                                // }

                                // if (arrayContainsArray(response[i].tags, ingredients)) {
                                //     strictArray.push(response[i])
                                // }

                                // if (arrayContainsArrayOrMore(response[i].tags, ingredients)) {
                                //     strictArray.push(response[i])
                                // }
                                // if (arrayContainsAny(response[i].tags, ingredients)) {
                                //     strictArray.push(response[i])
                                // }
                                for (var j = 0; j < ingredients.length; j++) {
                                    let ingredient = ingredients[j]
                                    let index = response[i].tags.indexOf(ingredient)
                                    let title = response[i].title
                                    strictObject[ingredient] = strictObject[ingredient] || []
                                    if (index >= 0) {
                                        strictObject[ingredient].push(title)
                                    }
                                }
                            }
                            console.log(strictObject)
                            Object.keys(strictObject).map(function(key, index) {
                                let value = strictObject[key];
                                console.log(value);
                                strictArray.push(value)
                            })
                            console.log(strictArray)
                            let arrayCommon = arraysCommon(strictArray)
                            if (arrayCommon.length) {
                                console.log(arrayCommon)
                            } else {
                                console.log('No s\'ha trobat cap recepta que contingui exactament aquests (o més) ingredients.')
                            }
                        },
                        error: function(err) {
                            console.log(err)
                        }
                    })
                    strictMode = true
                }
                return
            }
        })
        if (!strictMode) {
            $.ajax({
                dataType: "json",
                url: 'https://raw.githubusercontent.com/hiulit/hiulitscuisine/master/src/data/includes/tags.json',
                success: function(response) {
                    let inclusiveArray = []
                    for (let i = 0; i < response.length; i++) {
                        if (ingredients.includes(response[i].id)) {
                            console.log(response[i].id)
                            for (let j = 0; j < response[i].recipes.length; j++) {
                                // console.log(response[i].recipes[j])
                                inclusiveArray.push(response[i].recipes[j])
                            }
                        }
                    }
                    if (inclusiveArray.length) {
                        console.log(inclusiveArray)
                    } else {
                        console.log('No s\'ha trobat cap recepta que contingui, entre d\'altres, aquests ingredients.')
                    }
                },
                error: function(err) {
                    console.log(err)
                }
            })
        }
    }
})
