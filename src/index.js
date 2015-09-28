import request from 'superagent'
import camelCase from 'camelcase'
import { Promise } from 'es6-promise'

const SHEET_URL = 'https://spreadsheets.google.com/feeds/cells/{key}/{worksheetId}/public/values?alt=json';
const FEED_URL = 'https://spreadsheets.google.com/feeds/worksheets/{key}/public/basic?alt=json';

/**
 * @access public
 * @version 0.2.0
 * @since 0.1.5
 */
export default class SpreadSheet {

  /**
   * Get value from Google spreadsheet item
   * @access private
   * @param {Object} item - Google Spreadsheet item
   * @param {string} item.$t
   * @return {string}
   */
  _getValue (item) {
    return item.$t;
  }

  /**
   * Convert a string to camelCase for each data
   * @access private
   * @param {Object} item
   * @return {Object}
   */
  _camelCase (item) {
    for (let prop in item) {
      let prop2 = camelCase(prop);
      if (prop !== prop2) {
        item[prop2] = item[prop];
        delete item[prop];
      }
    }
    return item;
  }

  /**
   * Convert an Array to Object for each page if an attribute includes ': Object'
   * @access private
   * @param {Object} pages
   * @param {boolean} [camelcase=false] - boolean for camelcase
   * @return {Object}
   */
  _convertArrayToObject (pages, camelcase = false) {
    // Loop each page object
    for (let prop in pages) {
      // get page item
      let items = pages[prop]
      // objectId to be attribute
        , objectId = null
        
      items.forEach(item => {
        // Loop for each item by a row
        for (let prop in item) {

          let val = item[prop]
            , props = prop.split(':')
            , attr = props[0]
            , type = props[1]

          // If type is Object
          if (type && type.toLowerCase().indexOf('object') !== -1) {
            // Store attribute in objectId
            objectId = attr;
            // Create new item
            item[attr] = val;
            // Delete original item
            delete item[prop];
          }
        }

      });

      // Convert into Object if objectId exists
      if (objectId) {

        let data = {}
        items.forEach(item => {
          if (camelcase) {
            // Change attribute name with camelcase
            data[camelCase(item[objectId])] = item;
          } else {
            data[item[objectId]] = item;
          }
        });
        // Swap data
        pages[prop] = data;
      }

    }

    return pages
  }

  /**
   * Interface item by type
   * @access private
   * @param {Object} item
   * @return {Object}
   */
  _interfaceItem (item) {

    for (let prop in item) {

      let val = item[prop]
        , props = prop.split(':')
        , attr = props[0]
        , type = props[1]

      // Go to next if type doesn't exist
      if (!type) continue;

      type = type.toLowerCase();

      // If type is JSON
      if (type.indexOf('json') !== -1) {
        // Create array
        item[attr] = JSON.parse(val);
        // Delete original item
        delete item[prop];
      }
      // If type is Array
      else if (type.indexOf('array') !== -1) {
        // Create array
        item[attr] = val.split('|');
        // Delete original item
        delete item[prop];
      }
      // If type is int
      else if (type.indexOf('int') !== -1) {
        // Create integer
        item[attr] = parseInt(val.split(',').join(''));
        // Delete original item
        delete item[prop];
      }
      // If type is float
      else if (type.indexOf('float') !== -1 || type.indexOf('number') !== -1) {
        // Create floating number
        item[attr] = parseFloat(val.split(',').join(''));
        // Delete original item
        delete item[prop];
      }
      // If type is string
      else if (type.indexOf('string') !== -1) {
        // Create string
        item[attr] = val.toString();
        // Delete original item
        delete item[prop];
      }
      // If type is Object
      else if (type.indexOf('object') !== -1) {
        // Do nothing... yet
      }
      else {
        // Do nothing
      }
    }
    return item;
  }

  /**
   * Organize items by each row
   * @access private
   * @param {array} entry - result from Google Spreadsheet JSON
   * @return {Array<Object>}
   */
  _organizeWorkSheetItems (entry) {

    let items = []
      , attrs = {}

    entry.forEach(entryItem => {
      let {title, content} = entryItem
        , fullTitle = this._getValue(title)
        , col = fullTitle.charAt(0) // A, B, C, ...
        , row = parseInt(fullTitle.substr(1)) - 2 // -1, 0, 1, 2, 3, ...
        , label = this._getValue(content);

      if (row < 0) { // -1
        // Save item attribute
        attrs[col] = label;
      } else { // 0, 1, 2, 3, ...
        // Store data
        let data = items[row] || {};
        data[attrs[col]] = label;
        items[row] = data;
      }
    });

    return items.map(this._interfaceItem.bind(this));
  }

  /**
   * Get a worksheet data
   * @access private
   * @param {Object} feed
   * @param {string} feed.id - worksheet title.
   * @param {string} feed.worksheetId - worksheet id.
   * @return {Promise<Object, Error>} this is Promise return value.
   */
  _getWorkSheet (feed) {

    let { worksheetId } = feed
      , url = SHEET_URL.replace('{key}', this.key).replace('{worksheetId}', worksheetId);

    return new Promise((resolve, reject) => {

      this._getJSON(url)
        .then(res => {
          let { title, entry } = res.feed
          resolve({
            id: this._getValue(title)
          , items: this._organizeWorkSheetItems(entry)
          });
        })
        .catch(reject);

    });
  }

  /**
   * Promise for all worksheets
   * @access private
   * @param {Array<Object>} feeds - Array of feed data
   */
  _getAllWorkSheets (feeds) {

    return Promise.all(feeds.map(this._getWorkSheet.bind(this)));

  }

  /**
   * Get Feed list
   * @access private
   * @return {Promise<Object[], Error>} this is Promise return value.
   */
  _getSpreadSheetFeed () {

    let url = FEED_URL.replace('{key}', this.key);

    return new Promise((resolve, reject) => {

      this._getJSON(url)
        .then(res => {
          resolve(res.feed.entry.map(item => {
            let { title, id } = item
            return {
              id: this._getValue(title)
            , worksheetId: this._getValue(id).split('/').pop()
            }
          }));
        })
        .catch(reject);

    });
  }

  /**
   * Get JSON using superagent
   * @access private
   * @param {String} url url to load JSON
   * @return {Promise<Object, Error>} this is Promise return value.
   * @see https://visionmedia.github.io/superagent/
   */
  _getJSON (url) {

    return new Promise((resolve, reject) => {

      request
        .get(url)
        .set('Accept', 'application/json')
        .end((err, res) => {

          if (err) {
            
            if (err.message === 'OK') {

              // 400
              reject(new Error('HTTP 400 - Bad Request. Please make sure if the key is correct.'));

            } else {
              
              // Something else
              reject(err);
            }

          } else {
            
            if (res.ok) {

              // OK!!
              resolve(res.body);

            } else {

              // Something else
              reject(new Error(res.text));
            }

          }
        });

    });
  }

  /**
   * Load Google SpreadSheet
   * @access public
   * @param {Object} options
   * @param {boolean} [options.camelcase=false] - true if you want to make object property for each page as camel case.
   * @return {Promise<Object, Error>} this is Promise return value.
   * @example
   * let spreadSheet = new SpreadSheet('1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q');
   * spreadSheet.load()
   *  .then(function(res) { console.log(res); }) // json
   *  .catch(function(err) { console.error(err); }) // Error
   */
  load (options = {}) {

    return new Promise((resolve, reject) => {
      // First, get feed json to get all worksheets
      this._getSpreadSheetFeed()
        // Next, get json for all worksheets
        .then(this._getAllWorkSheets.bind(this))
        .then(res => {
          // At last, create data by worksheet name
          let pages = {}
          res.forEach(d => {
            // change case as camel
            if (options.camelcase === true) {
              pages[camelCase(d.id)] = d.items.map(this._camelCase.bind(this));
            } else {
              pages[d.id] = d.items;
            }
          });
          // Convert Array to Object if the first col in the first row has Object type
          pages = this._convertArrayToObject(pages, options.camelcase);
          resolve(pages);
        })
        .catch(reject);
    });
  }
  
  /**
   * @access public
   * @param {string} key - A key extracted from Google SpreadSheet
   * @example
   * let spreadSheet = new SpreadSheet('1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q');
   * let key = spreadSheet.key;
   * console.log(key); // '1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q'
   */
  constructor (key) {
    /**
     * @type {string}
     * @access private
     */
    this._key = key;

  }

  /**
   * @type {string}
   */
  get key () {
    return this._key;
  }

}
