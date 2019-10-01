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
    self.getProject().getOrgMetadataIndexWithSelections(null, null, self.payload.packageXmlPath)
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
    .command('get-metadata-index-for-package')
    .description('Gets metadata index for a given package location')
    .action(function() {
      var self = this;
      util.getPayload()
        .then(function(payload) {
          program.commandExecutor.execute({
            name   : self._name,
            body   : payload,
            editor : self.parent.editor
          });
        });
    });
};
