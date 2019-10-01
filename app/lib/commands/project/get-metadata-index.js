/**
 * @file Returns the medadata index for a project
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var inherits    = require('inherits');
var BaseCommand = require('../../command');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.getProject().getOrgMetadataIndexWithSelections()
    .then(function(metadataIndex) {
      resolve(metadataIndex);
    })
    .catch(function(error) {
      reject(error);
    });
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('get-metadata-index')
    .description('Returns indexed metadata')
    .action(function(/* Args here */){
      program.commandExecutor.execute({
        name : this._name
      });
    });
};
