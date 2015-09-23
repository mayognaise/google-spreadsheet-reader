var SpreadSheet = require('../dist');
var jsonMarkup = require('json-markup');

// Google SpreadSheet ID
var key = '1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q';

// Create SpreadSheet Object
var spreadSheet = new SpreadSheet(key);

// Load all pages
spreadSheet.load({camelcase: true})
  .then(function(res) {

    // Log
    console.log(res);

    // Display json to body
    document.body.innerHTML = jsonMarkup(res);

  })
  .catch(function(err) {

    // Log
    console.error(err.message);

    // Alert
    alert(err.message);

  });