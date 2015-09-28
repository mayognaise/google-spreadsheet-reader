# google-spreadsheet-reader

Converts a Google SpreadSheet to a pretty JSON.

This works with both server server-side and client-side :)

### Demo [Click here](http://mayognaise.github.io/google-spreadsheet-reader/)

![Home](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0000_home.png)

## Install

```sh
$ npm install google-spreadsheet-reader
```


## Preparation

### Publish to the web

Select [**File > Publish to the web…**]

![Publish to the web](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0001_publish-to-the-web.png)

Click [**Publish**]

![Start publish](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0002_start-publish.png)

Done!

![Published](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0003_published.png)


### Customize documents

After toggle [**Published content & settings**], select documents you want to publish. Then click [**Start publishing**]

![Custom documents](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0004_custom-documents.png)


### Stop publishing

After toggle [**Published content & settings**], click [**Stop publishing**]

![Stop publish](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0005_stop-publish.png)

## Usage

### Example

For example, see [this spreadsheet example](https://docs.google.com/spreadsheets/d/1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q/edit?usp=sharing).


### Get key

Use the `key` from the URL.

![Copy key](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_0006_copy-id.png)

```js
var SpreadSheet = require('google-spreadsheet-reader');

// Create SpreadSheet Object
var spreadSheet = new SpreadSheet('1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q');
```

### Basic example:

```js
spreadSheet.load()
  .then(function(res) { console.log(res); }) // beautiful JSON!
  .catch(function(err) { console.error(err.message); }); // Aw, something happened.
```

Result:

![Copy key](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_result1.png)


### Options:

You can change the property names to [camelCase](https://github.com/sindresorhus/camelcase/blob/master/readme.md#usage) by setting the `camelcase` flag to `true`.

```js
spreadSheet.load({ camelcase: true })
  .then(function(res) { console.log(res); }) // JSON with camelcased properties!
  .catch(function(err) { console.error(err.message); });
```

Result:

![Copy key](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_result2.png)


### Represent data types

You can represent [JSON data types](https://en.wikipedia.org/wiki/JSON#Data_types.2C_syntax_and_example) with the following spreadsheet configurations.

#### int / float / number

Add type next to property. (**e.g.** `Population: int`)

![Continents](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_continents.png)

#### Array / JSON

For `Array`, split items with `|` (**e.g.** `Genotype: Array`)

![Blood Type](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_blood-type.png)

### Convert page items to `Object`

You can create an `Object` type and with the first column, define its properties.

Add `: Object` next to the first property. (**e.g.** `id: Object`)

![Copy](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_copy.png)

