console.log(process.version);

import SpreadSheet from '../../src/'

const KEY = '1lBbCRh6N2Ozz8oEB9fIRN4vuUNQhErqGbAQbHAu2w5Q';

let spreadSheet = new SpreadSheet(KEY);
spreadSheet.load({camelcase: true})
  .then(res => { console.log(res); })
  .catch(err => { console.error(err); })
