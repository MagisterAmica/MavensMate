/**
 * @file Updates a project's settings
 * @author William Brockhus
 */

'use strict';

var util        = require('../../util');
var inherits    = require('inherits');
var BaseCommand = require('../../command');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.getProject()
    .writeSettings(self.payload)
    .then(function () {
      resolve('Settings updated successfully!');
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

exports.command = Command;
exports.addSubCommand = function (program) {
  program
  .command('update-settings')
  .description('Update a project\'s settings')
  .action(function () {
    var self = this;
    util.getPayload()
    .then(function (payload) {
      program.commandExecutor.execute({
        name   : self._name,
        body   : payload,
        editor : self.parent.editor,
      });
    });
  });
};
