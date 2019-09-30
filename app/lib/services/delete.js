/**
 * @file Responsible for deletion of Salesforce metadata (Custom Objects, Apex Classes, Lightning files, etc.)
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var _                 = require('lodash');
var logger            = require('winston');
var LightningService  = require('./lightning');
var Deploy            = require('./deploy');
var fs                = require('fs-extra');
var util              = require('../util');
var path              = require('path');
var MetadataHelper    = require('../metadata').MetadataHelper;
var mavensMateFile    = require('../file');
var config            = require('../../config');

/**
 * Responsible for deleting server and local copies of files/directories
 * @param {Project} project - project instance (required)
 * @param {Array} paths - array of path strings [ 'foo/bar/src/classes', 'foo/bar/src/pages/foo.page' ]
 */
var DeleteDelegate = function(project, paths) {
  if (!project || !paths) {
    throw new Error('DeleteDelegate requires a valid project instance and an array of paths to delete.');
  }
  this.project = project;
  this.paths = paths;
  this.metadataHelper = new MetadataHelper({ sfdcClient: this.project.sfdcClient });
};

/**
 * Executes local and server delete for all delegate paths
 * @return {Promise}
 */
DeleteDelegate.prototype.execute = function() {
  // TODO: implement stash
  var self = this;
  var deleteResult;
  return new Promise(function(resolve, reject) {
    _.each(self.paths, function(p) {
      if (!fs.existsSync(p)) {
        return reject(new Error('Invalid delete request. Path does not exist: '+p));
      }
    });

    self._performDelete()
      .then(function(res) {
        deleteResult = res;
        return self._deleteEmptyProjectDirectories();
      })
      .then(function() {
        resolve(deleteResult);
      })
      .catch(function(err) {
        // TODO: revert via stash
        reject(err);
      });
  });
};

DeleteDelegate.prototype._deleteEmptyProjectDirectories = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      fs.readdirSync(path.join(self.project.path, 'src'))
        .filter(function(res) {
          if (fs.statSync(path.join(self.project.path, 'src', res)).isDirectory()) {
            if (util.isDirectoryEmptySync(path.join(self.project.path, 'src', res))) {
              fs.removeSync(path.join(self.project.path, 'src', res));
            }
          }
        });
      resolve();
    } catch(e) {
      reject(e);
    }
  });
};

DeleteDelegate.prototype._performDelete = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (self.paths.length === 0) {
      return resolve();
    }

    var files = mavensMateFile.createFileInstances(self.paths);
    var lightningBundleItemFiles = mavensMateFile.getLightningBundleItemFiles(files);
    var deleteSubscription = mavensMateFile.createPackageSubscription(files, self.project.packageXml);

    logger.silly('files to delete', files);
    logger.silly('lightningBundleItemFiles to delete', lightningBundleItemFiles);
    logger.silly('deleteSubscription', deleteSubscription);

    var result = {};
    var deployOptions = {
      purgeOnDelete : config.get('mm_purge_on_delete') || false
    };
    var deploy = new Deploy({ project: self.project });
    deploy.stageDelete(deleteSubscription)
      .then(function(zipStream) {
        return deploy.executeStream(zipStream, deployOptions);
      })
      .then(function(res) {
        result = res;
        logger.debug('Deletion result via metadata API: '+ JSON.stringify(result));
        if (result.success && result.status === 'Succeeded') {
          logger.debug('deleting paths locally');
          _.each(files, function(sp) {
            logger.debug('deleting: '+sp.path);
            sp.deleteLocally();
          });
        }
        if (!result.details.componentSuccesses) {
          result.details.componentSuccesses = [];
        } else if (!_.isArray(result.details.componentSuccesses)) {
          result.details.componentSuccesses = [result.details.componentSuccesses];
        }
        if (!result.details.componentFailures) {
          result.details.componentFailures = [];
        } else if (!_.isArray(result.details.componentFailures)) {
          result.details.componentFailures = [result.details.componentFailures];
        }

        logger.warn('---->', result);

        return self._deleteLightningBundleItemFiles(lightningBundleItemFiles);
      })
      .then(function(res) {
        if (res) {
          _.each(res, function(r) {
            if (!r.success) {
              result.numberComponentErrors++;
              result.details.componentFailures.push(r);
            } else {
              result.numberComponentsDeployed++;
              result.details.componentSuccesses.push(r);
            }
            result.numberComponentsTotal++;
          });
          if (!_.find(res, { success: false })) {
            _.each(lightningBundleItemFiles, function(sp) {
              sp.deleteLocally();
            });
            if (res.status === 'Succeeded' && res.success) {
              res.status = 'Failed';
              res.success = false;
            }
          }
        }
        // console.log(result);
        logger.debug(JSON.stringify(result));
        resolve(result);
      })
      .catch(function(error) {
        reject(error);
      })
      .done();
  });
};

/**
 * Retrieves source of lightning bundle items, overwrite local copies
 * @param  {Array} lightningMetadata - array of Metadata of type Lightning
 * @return {Promise}
 * TODO: overwrite local copies
 */
DeleteDelegate.prototype._deleteLightningBundleItemFiles = function(lightningFiles) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (lightningFiles.length === 0) {
      return resolve();
    }

    logger.debug('deleting lightning components');
    logger.debug(lightningFiles[0].path);

    var lightningService = new LightningService(self.project);
    lightningService.deleteBundleItems(lightningFiles)
      .then(function(result) {
        logger.debug('delete result: ');
        logger.debug(result);
        resolve(result);
      })
      .catch(function(error) {
        reject(error);
      })
      .done();
  });
};

module.exports = DeleteDelegate;
