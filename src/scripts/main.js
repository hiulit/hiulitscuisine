function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false
    let arr1 = _arr1.concat().sort()
    let arr2 = _arr2.concat().sort()
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i])
            return false
    }
    return true
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
        let ingredients = string.split(',').map((item) => item.trim())
        // console.log(ingredients)
        $.ajax({
            dataType: "json",
            url: 'https://raw.githubusercontent.com/hiulit/hiulitscuisine/master/src/data/includes/tags.json',
            // data: data,
            success: function(response) {
                for (let i = 0; i < response.length; i++) {
                    if (ingredients.includes(response[i].id)) {
                        console.log(response[i].id)
                        for (let j = 0; j < response[i].recipes.length; j++) {
                            console.log(response[i].recipes[j])
                        }
                    }
                }
            },
            error: function(err) {
                console.log(err)
            }
        })
    }
})
