function slugify(str) {
    const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return str.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(p, c =>
            b.charAt(a.indexOf(c)))     // Replace special chars
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
}

function compare(a, b) {
    return Math.round((a.length / b.length) * 100)
}

function search(ingredients) {
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
            let searchResults = []
            for (let recipe of recipes) {
                let original = recipe.tags
                original.title = 'recepta'
                let common = []
                common.title = 'coincideixen'
                let outLeft = []
                outLeft.title = 'falten'
                let outRight = []
                outRight.title = 'sobren'
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
                let result = [original, outLeft, common, outRight, compare(common, recipe.tags), compare(common, ingredients)]
                result.title = recipe.title
                searchResults.push(result)
            }
            searchResults = searchResults
                        .sort((a, b) => { return b[4] - a[4] })
                        .filter((item) => { return item[4] && item[5] > 0 })

            console.log(searchResults.length > 0)
            console.log(ingredients)

            let template

            if (searchResults.length > 0) {
                template = `
                    <p class="search-results-title">Resultats de la cerca: ${ingredients.map(ingredient => `<strong>${ingredient}</strong>`).join(', ')}</p>
                    <ul class="search-results-list">
                    ${searchResults.map(result =>
                        `<li class="search-results-item">
                            <a href="/receptes/${slugify(result.title)}.html">${result.title}</a>
                            ${result[1].length ? `<p><strong>Et falta</strong>: ${result[1].join(', ')}</p>` : ''}
                            ${result[3].length ? `<p><strong>Et sobra</strong>: <span style="text-decoration: line-through;">${result[3].join(', ')}</span></p>` : ''}
                        </li>`
                    ).join('')}
                    </ul>
                `
            } else {
                template = `
                    <p>No hi ha cap recepta amb aquests ingredients: ${ingredients.map(ingredient => `<strong>${ingredient}</strong>`).join(', ')}</p>
                `
                console.log()
            }

            if (template) document.querySelector('.js-search-results').innerHTML = template
        },
        error: function(err) {
            console.log(err)
        }
    })
}

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
        let string = $('#search-input').val()
        let ingredients = string.split(',').map((item) => item.trim()).filter((item) => item !== (undefined || null || ''))
        search(ingredients)
    }
})
