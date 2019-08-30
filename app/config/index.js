'use strict';

const electron = require('electron');
const schema = require('./schema');
const MavenStore = require('./MavenStore');

let store;

function cleanWindowSettings() {
  // tweak window min/max values
  schema.window.properties.width.maximum = electron.screen.getPrimaryDisplay().workAreaSize.width;
  schema.window.properties.height.maximum = electron.screen.getPrimaryDisplay().workAreaSize.height;
  // 100px is a buffer to ensure some of the window can be seen to be dragged
  schema.window.properties.x.maximum = electron.screen.getPrimaryDisplay().workAreaSize.width - 100;
  schema.window.properties.y.maximum = electron.screen.getPrimaryDisplay().workAreaSize.height - 100;
}

function init() {

  // initialise data store
  store = new MavenStore({schema});

  // ensure window min/max values are within permitted range
  for (let key in schema.window.properties) {
    for (let minmax of ['minimum', 'maximum']) {
      if (store.get(`window.${key}`) > schema.window.properties[key][minmax]) {
        store.set(`window.${key}`, schema.window.properties[key][minmax]);
      }
    }
  }

  // handle changing of browser window
  electron.app.on('ready', cleanWindowSettings);

  // set http proxy if given
  if (store.has('mm.http_proxy')) {
    process.env.http_proxy = store.get('mm.http_proxy');
  }

  // set https proxy if given
  if (store.has('mm.https_proxy')) {
    process.env.https_proxy = store.get('mm.https_proxy');
  }
}

init();

module.exports = store;
