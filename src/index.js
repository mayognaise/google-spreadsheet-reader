'use strict';

/**
  * SuperAgent: a light-weight progressive ajax API
  * http://visionmedia.github.io/superagent/
  */
var request = require('superagent');

/**
  * camelcase: Convert a dash/dot/underscore/space separated string to camelCase
  * https://www.npmjs.com/package/camelcase
  */
var camelCase = require('camelcase');

var url = 'https://spreadsheets.google.com/feeds/cells/{key}/{worksheetId}/public/values?alt=json'
  , feed = 'https://spreadsheets.google.com/feeds/worksheets/{key}/public/basic?alt=json';

var spreadSheet = {
  get (key) {
    return new Promise((resolve, reject) => {
      var pageItems = []
        , feedUrl = feed.replace('{key}', key);
      this.getSpreadSheetFeed(feedUrl).then((pages) => {
        _.each(pages, (item) => {
          var {worksheetId} = item
            , loadUrl = url.replace('{key}', key).replace('{worksheetId}', worksheetId);
          this.getSpreadPage(loadUrl)
            .then((feed) => {
              var {title, entry} = feed
                , tempData = {}
                , tempLabels = {}
                , pageItem = {};
              pageItem.id = camelCase(title.$t);
              pageItem.items = [];
              _.each(entry, (item) => {
                var {title, content} = item
                  , col = title.$t.charAt(0)
                  , row = title.$t.substr(1)
                  , label = content.$t;
                if(row === '1') {
                  tempLabels[col] = camelCase(label);
                } else {
                  var data = tempData[row] || {};
                  data[tempLabels[col]] = label;
                  tempData[row] = data;
                }
              });
              _.each(tempData, (data) => {
                pageItem.items.push(data);
              });
              pageItems.push(pageItem);
              if(pageItems.length === pages.length) {
                var model = {};
                _.each(pageItems, (item) => {
                  // make camel case
                  var data = {};
                  _.each(item.items, (dat) => {
                    dat.id = camelCase(dat.id);
                    data[dat.id] = dat;
                  });
                  model[item.id] = data;
                });
                resolve(model);
              }
            });
        });
      });
    });
  },
  getSpreadPage (url) {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .end((err, res) => {
          if (res.ok) { // Success
            resolve(res.body.feed);
          }
          else {  // Something went wrong (404 etc.)
            reject(new Error(res.text));
          }
        });
    });
  },
  getSpreadSheetFeed (url) {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .end((err, res) => {
          if (res.ok) { // Success
            var feeds = [];
            _.each(res.body.feed.entry, (item) => {
              var {title, id} = item;
              feeds.push({
                id: camelCase(title.$t),
                worksheetId: _.last(id.$t.split('/'))
              });
            });
            resolve(feeds);
          }
          else {  // Something went wrong (404 etc.)
            reject(new Error(res.text));
          }
        });
    });
  }
};

module.exports = spreadSheet;