# google-spreadsheet-reader

Convert Google SpreadSheet to a nicely JSON.

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

Use `key` from URL.

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

You can change the properties as camel case.

```js
spreadSheet.load({ camelcase: true })
  .then(function(res) { console.log(res); }) // JSON with camelcased properties!
  .catch(function(err) { console.error(err.message); });
```

Result:

![Copy key](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_result2.png)


### Convert interface

You can add a schema for each collumn to change the interface

#### int / float / number

Add type next to property. (**e.g.** `Population: int`)

![Continents](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_continents.png)

#### Array / JSON

For `Array`, split items with `|` (**e.g.** `Genotype: Array`)

![Blood Type](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_blood-type.png)

### Convert page items to Object

You can create Object with the first collumn as property.

Add `: Object` next to the first property. (**e.g.** `id: Object`)

![Copy](https://dl.dropboxusercontent.com/u/3497191/gsr/gsr_interface_copy.png)

