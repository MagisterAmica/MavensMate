/*
 * Extension of the ElectronStore class
 * Enables us to get default values from schema,
 * and transform legacy mm_ properties
 */

const ElectronStore = require('electron-store');

class MavenStore extends ElectronStore {

  #default_store;

  static transformKey(key) {
    if (key.startsWith('mm_')) {
      key = 'mm.' + key.substring(3);
    }
    return key;
  }

  static setDefaults(schema, store, key_chain) {
    for (let [key, value] of Object.entries(schema)) {
      let this_key = (key_chain ? key_chain + '.' : '') + key;
      if (value.type === 'object') {
        return this.setDefaults(value.properties, store, this_key);
      }
      if (!store.has(key) && Object.hasOwnProperty.call(value, 'default')) {
        store.set(this_key, value.default);
      }
    }
  }

  constructor(options) {
    super(options);

    if (Object.hasOwnProperty.call(options, 'schema')) {
      this.default_store = new ElectronStore(options);
      this.constructor.setDefaults(options.schema, this.default_store);
    }
  }

  get(key, default_value) {
    key = this.constructor.transformKey(key);

    if (super.has(key)) {
      return super.get(key);
    }

    if (default_value !== undefined) {
      return default_value;
    }

    if (this.default_schema !== undefined) {
      return this.default_schema.get(key, default_value);
    }

    return undefined;
  }

  getDefault(key) {
    key = this.constructor.transformKey(key);

    if (this.default_store !== undefined) {
      return this.default_store.get(key);
    }

    return undefined;
  }

  set(key, value) {
    key = this.constructor.transformKey(key);

    return super.set(key, value);
  }
}

module.exports = MavenStore;
