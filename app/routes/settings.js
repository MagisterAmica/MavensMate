'use strict';

const express         = require('express');
const router          = express.Router();
const config          = require('../config');
const defaultSettings = require('../config/schema').mm.properties;

router.get('/', function(req, res) {
  var locals = {
    userSettings: config.get('mm'),
    defaultSettings: defaultSettings,
    title: 'Global Settings'
  };
  res.render('settings/index.html', locals);
});

router.post('/', function(req, res) {
  try {
    let updatedSetting = defaultSettings[req.body.settingKey];
    let settingValue = req.body.settingValue;
    if (updatedSetting.type === 'integer') {
      settingValue = parseInt(settingValue); // parse string from the dom to int for storage
    } else if (updatedSetting.type === 'object' || updatedSetting.type === 'array') {
      settingValue = JSON.parse(settingValue);
    } else if (updatedSetting.type === 'string' && settingValue[0] === '"' && settingValue[settingValue.length - 1] === '"') {
      return res.status(500).send({ error: 'Failed to update '+req.body.settingKey+': Invalid string setting value. You should not wrap your string setting value in quotes.' });
    }
    config.set('mm.' + req.body.settingKey, settingValue);
    return res.status(200).send();
  } catch(err) {
    return res.status(500).send({ error: 'Failed to update '+req.body.settingKey+': '+ err.message });
  }
});

module.exports = router;
