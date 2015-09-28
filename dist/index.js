'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _es6Promise = require('es6-promise');

var SHEET_URL = 'https://spreadsheets.google.com/feeds/cells/{key}/{worksheetId}/public/values?alt=json';
var FEED_URL = 'https://spreadsheets.google.com/feeds/worksheets/{key}/public/basic?alt=json';

/**
 * @access public
 * @version 0.1.9
 * @since 0.1.5
 */

var SpreadSheet = (function () {
  _createClass(SpreadSheet, [{
    key: '_getValue',

    /**
     * Get value from Google spreadsheet item
     * @access private
     * @param {Object} item - Google Spreadsheet item
     * @param {string} item.$t
     * @return {string}
     */
    value: function _getValue(item) {
      return item.$t;
    }

    /**
     * Convert a string to camelCase for each data
     * @access private
     * @param {Object} item
     * @return {Object}
     */
  }, {
    key: '_camelCase',
    value: function _camelCase(item) {
      for (var prop in item) {
        var prop2 = (0, _camelcase2['default'])(prop);
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
  }, {
    key: '_convertArrayToObject',
    value: function _convertArrayToObject(pages) {
      var camelcase = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var _loop = function (prop) {
        // get page item
        var items = pages[prop],

        // objectId to be attribute
        objectId = null;

        items.forEach(function (item) {
          // Loop for each item by a row
          for (var _prop in item) {

            var val = item[_prop],
                props = _prop.split(':'),
                attr = props[0],
                type = props[1];

            // If type is Object
            if (type && type.toLowerCase().indexOf('object') !== -1) {
              // Store attribute in objectId
              objectId = attr;
              // Create new item
              item[attr] = val;
              // Delete original item
              delete item[_prop];
            }
          }
        });

        // Convert into Object if objectId exists
        if (objectId) {
          (function () {

            var data = {};
            items.forEach(function (item) {
              if (camelcase) {
                // Change attribute name with camelcase
                data[(0, _camelcase2['default'])(item[objectId])] = item;
              } else {
                data[item[objectId]] = item;
              }
            });
            // Swap data
            pages[prop] = data;
          })();
        }
      };

      // Loop each page object
      for (var prop in pages) {
        _loop(prop);
      }

      return pages;
    }

    /**
     * Interface item by type
     * @access private
     * @param {Object} item
     * @return {Object}
     */
  }, {
    key: '_interfaceItem',
    value: function _interfaceItem(item) {

      for (var prop in item) {

        var val = item[prop],
            props = prop.split(':'),
            attr = props[0],
            type = props[1];

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
                  } else {
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
  }, {
    key: '_organizeWorkSheetItems',
    value: function _organizeWorkSheetItems(entry) {
      var _this = this;

      var items = [],
          attrs = {};

      entry.forEach(function (entryItem) {
        var title = entryItem.title;
        var content = entryItem.content;
        var fullTitle = _this._getValue(title);
        var col = fullTitle.charAt(0); // A, B, C, ...
        var row = parseInt(fullTitle.substr(1)) - 2; // -1, 0, 1, 2, 3, ...
        var label = _this._getValue(content);

        if (row < 0) {
          // -1
          // Save item attribute
          attrs[col] = label;
        } else {
          // 0, 1, 2, 3, ...
          // Store data
          var data = items[row] || {};
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
  }, {
    key: '_getWorkSheet',
    value: function _getWorkSheet(feed) {
      var _this2 = this;

      var worksheetId = feed.worksheetId;
      var url = SHEET_URL.replace('{key}', this.key).replace('{worksheetId}', worksheetId);

      return new _es6Promise.Promise(function (resolve, reject) {

        _this2._getJSON(url).then(function (res) {
          var _res$feed = res.feed;
          var title = _res$feed.title;
          var entry = _res$feed.entry;

          resolve({
            id: _this2._getValue(title),
            items: _this2._organizeWorkSheetItems(entry)
          });
        })['catch'](reject);
      });
    }

    /**
     * Promise for all worksheets
     * @access private
     * @param {Array<Object>} feeds - Array of feed data
     */
  }, {
    key: '_getAllWorkSheets',
    value: function _getAllWorkSheets(feeds) {

      return _es6Promise.Promise.all(feeds.map(this._getWorkSheet.bind(this)));
    }

    /**
     * Get Feed list
     * @access private
     * @return {Promise<Object[], Error>} this is Promise return value.
     */
  }, {
    key: '_getSpreadSheetFeed',
    value: function _getSpreadSheetFeed() {
      var _this3 = this;

      var url = FEED_URL.replace('{key}', this.key);

      return new _es6Promise.Promise(function (resolve, reject) {

        _this3._getJSON(url).then(function (res) {
          resolve(res.feed.entry.map(function (item) {
            var title = item.title;
            var id = item.id;

            return {
              id: _this3._getValue(title),
              worksheetId: _this3._getValue(id).split('/').pop()
            };
          }));
        })['catch'](reject);
      });
    }

    /**
     * Get JSON using superagent
     * @access private
     * @param {String} url url to load JSON
     * @return {Promise<Object, Error>} this is Promise return value.
     * @see https://visionmedia.github.io/superagent/
     */
  }, {
    key: '_getJSON',
    value: function _getJSON(url) {

      return new _es6Promise.Promise(function (resolve, reject) {

        _superagent2['default'].get(url).set('Accept', 'application/json').end(function (err, res) {

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
  }, {
    key: 'load',
    value: function load() {
      var _this4 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return new _es6Promise.Promise(function (resolve, reject) {
        // First, get feed json to get all worksheets
        _this4._getSpreadSheetFeed()
        // Next, get json for all worksheets
        .then(_this4._getAllWorkSheets.bind(_this4)).then(function (res) {
          // At last, create data by worksheet name
          var pages = {};
          res.forEach(function (d) {
            // change case as camel
            if (options.camelcase === true) {
              pages[(0, _camelcase2['default'])(d.id)] = d.items.map(_this4._camelCase.bind(_this4));
            } else {
              pages[d.id] = d.items;
            }
          });
          // Convert Array to Object if the first col in the first row has Object type
          pages = _this4._convertArrayToObject(pages, options.camelcase);
          resolve(pages);
        })['catch'](reject);
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
  }]);

  function SpreadSheet(key) {
    _classCallCheck(this, SpreadSheet);

    /**
     * @type {string}
     * @access private
     */
    this._key = key;
  }

  /**
   * @type {string}
   */

  _createClass(SpreadSheet, [{
    key: 'key',
    get: function get() {
      return this._key;
    }
  }]);

  return SpreadSheet;
})();

exports['default'] = SpreadSheet;
module.exports = exports['default'];