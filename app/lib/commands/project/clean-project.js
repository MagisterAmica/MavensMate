/**
 * @file Reverts a project to its server state based on package.xml
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var inherits        = require('inherits');
var EditorService   = require('../../services/editor');
var BaseCommand     = require('../../command');
var logger          = require('winston');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.getProject().clean()
      .then(function() {
        if (self.editorService && self.editorService.editor === 'sublime') {
          self.editorService.runCommand('refresh_folder_list')
            .then(function() {
              resolve();
            })
            .catch(function(err) {
              logger.error(err);
              resolve();
            });
        } else {
          return Promise.resolve();
        }
      })
      .then(function() {
        resolve('Project cleaned successfully');
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
    .command('clean-project')
    .alias('clean')
    .description('Retrieves metadata from server based on project package.xml file, resets session')
    .action(function(/* Args here */){
      program.commandExecutor.execute({
        name : this._name
      });
    });
};
