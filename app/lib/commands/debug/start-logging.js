/**
 * @file Deletes existing trace flags and creates new trace flags for all user ids listed in a project's config/.debug file
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var inherits    = require('inherits');
var BaseCommand = require('../../command');
var moment      = require('moment');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var project = self.getProject();
    var sfdcClient = project.sfdcClient;
    var projectDebugSettings = project.getDebugSettingsSync();
    var expirationDate = moment().add(projectDebugSettings.expiration, 'minutes');
    sfdcClient.startLogging(projectDebugSettings, expirationDate)
      .then(function() {
        resolve('Started logging for debug users');
      })
      .catch(function(error) {
        reject(error);
      })
      .done();
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('start-logging')
    .description('Starts logging Apex execution for all user ids listed in your project\'s config/.debug file')
    .action(function(/* Args here */){
      program.commandExecutor.execute({
        name : this._name
      });
    });
};
