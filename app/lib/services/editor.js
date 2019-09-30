/**
 * @file Responsible for launching MavensMate UIs and opening files in the client self.editor
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var _           = require('lodash');
var which       = require('which');
var spawn       = require('child_process').spawn;
var logger      = require('winston');
var util        = require('../util');
var config      = require('../../config');
var path        = require('path');
var os          = require('os');
var fs          = require('fs-extra');
var open        = require('open');
var querystring = require('querystring');

/**
 * Service to handle interaction with the self.editor (sublime, atom, etc.)
 * @param {String} self.editor - name of the self.editor
 */
var EditorService = function(editor, openWindowFn) {
  this.editor = editor;
  this.openWindowFn = openWindowFn;
  this.supportedEditors = this._getSupportedEditors();
  if (this.editor && !this._isSupportedEditor(this.editor)) {
    throw new Error(this.editor+' was not found in list of supported editors. Please check your global settings to ensure the self.editor path for '+this.editor+' is configured correctly.');
  }
};

EditorService.prototype._isSupportedEditor = function(editor) {
  if (!this.supportedEditors[this.editor]) {
    logger.error('Unsupported editor. Supported editors: ', this.supportedEditors);
    return false;
  }
  return true;
};

EditorService.prototype._getSupportedEditors = function() {
  var editors = {};
  var atomLocationConfig = config.get('mm_atom_exec_path')[util.platformConfigKey] || config.get('mm_atom_exec_path');
  var vsCodeLocationConfig = config.get('mm_vscode_exec_path')[util.platformConfigKey] || config.get('mm_vscode_exec_path');
  var pathAtomLocation, pathSublLocation, pathVsCodeLocation;
  try { pathVsCodeLocation = which.sync('code'); } catch(e){}
  try { pathAtomLocation = which.sync('atom'); } catch(e){}
  var sublLocationConfig = config.get('mm_subl_location')[util.platformConfigKey] || config.get('mm_subl_location');
  try { pathSublLocation = which.sync('subl'); } catch(e){}
  var atomPath = fs.existsSync(atomLocationConfig) ? atomLocationConfig : pathAtomLocation;
  var sublPath = fs.existsSync(sublLocationConfig) ? sublLocationConfig : pathSublLocation;
  var vsCodePath = fs.existsSync(vsCodeLocationConfig) ? vsCodeLocationConfig : pathVsCodeLocation;
  if (atomPath) {
    editors.atom = atomPath;
  }
  if (sublPath) {
    editors.sublime = sublPath;
  }
  if (vsCodePath) {
    editors.vscode = vsCodePath;
  }
  return editors;
};

/**
 * Launches the MavensMate UI in either MavensMateWindowServer.app (osx) or the web browser (Linux/Windows)
 * @param  {String} commandName
 * @return {Nothing}
 */
EditorService.prototype.launchUI = function(appPath, urlParams) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var portNumber = process.env.MAVENSMATE_SERVER_PORT;

    if (!portNumber) {
      return reject(new Error('Could not detect local MavensMate server port. Set MAVENSMATE_SERVER_PORT environment variable.'));
    }

    var url = 'http://localhost:'+portNumber+'/app/'+appPath;
    if (self.editor && urlParams) {
      urlParams.editor = self.editor;
    } else if (self.editor) {
      urlParams = {};
      urlParams.editor = self.editor;
    }
    if (urlParams) {
      url += '?'+querystring.stringify(urlParams);
    }

    logger.debug('opening url --->');
    logger.debug(url);

    // todo: refactor windowopener (this is used by mavensmate-desktop)
    if (self.openWindowFn) {
      self.openWindowFn(url);
      resolve();
    } else {
      // open web browser
      open(url, function() {
        resolve();
      });

    }
  });
};

/**
 * Opens the specified URL in the user's browser (should probably be located in util, but oh well)
 * @param  {String} url - url to open in the browser
 */
EditorService.prototype.openUrl = function(url) {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      if (self.openWindowFn) {
        self.openWindowFn(url);
        resolve();
      } else if (os.platform() === 'darwin') {
        var browserChildProcess = spawn('open', [url], {
          detached : true
        });

        browserChildProcess.on('close', function (code) {
          if (code === 0) {
            resolve();
          }
        });
      } else {
        // open web browser
        open(url, function() {
          resolve();
        });
      }
    } catch(e) {
      reject(e);
    }
  });
};

EditorService.prototype.runCommand = function(commandName) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.editor === 'sublime') {
      var editorExe = spawn(self.supportedEditors[self.editor], ['--command', commandName]);
      editorExe.stdout.on('data', function (data) {
        logger.debug('editor command STDOUT:');
        logger.debug(data);
      });

      editorExe.stderr.on('data', function (data) {
        logger.error('ERROR: Result of run command in editor: ');
        logger.error(data);
        return resolve(); // we resolve bc this is not a life/death operation
      });

      editorExe.on('close', function(code) {
        logger.debug('editorExe close: ');
        logger.debug(code);
        if (code !== 0) {
          logger.error('Could not run command in '+self.editor);
          resolve();
        } else {
          resolve();
        }
      });

      editorExe.on('error', function(err) {
        logger.error(err);
        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Open a specific path in the editor
 * @param  {String} path - path to open
 * @return {Nothing}
 */
EditorService.prototype.open = function(path) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var editorExe = spawn(self.supportedEditors[self.editor], [ path ]);
    editorExe.stdout.on('data', function (data) {
      logger.debug('editorExe STDOUT:');
      logger.debug(data);
    });

    editorExe.stderr.on('data', function (data) {
      logger.error('Result of path open in self.editor: ');
      logger.error(data);
      return reject(new Error('Could not open in editor'));
    });

    editorExe.on('close', function(code) {
      logger.debug('editorExe close: ');
      logger.debug(code);
      if (code !== 0) {
        reject(new Error('Could not open path in '+self.editor+'. Check your MavensMate global settings to ensure self.editor paths are configured properly for '+self.editor));
      } else {
        resolve();
      }
    });

    editorExe.on('error', function(err) {
      return reject(err);
    });
  });
};

module.exports = EditorService;
