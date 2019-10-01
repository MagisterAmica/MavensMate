/**
 * @file Creates a new org connection for the project
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var util                  = require('../../util');
var OrgConnectionService  = require('../../services/org-connection');
var inherits              = require('inherits');
var BaseCommand           = require('../../command');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var project = self.getProject();
    var orgConnectionService = new OrgConnectionService(project);
    orgConnectionService.add(self.payload)
      .then(function() {
        resolve('Org connection successfully created');
      })
      .catch(function(error) {
        reject(error);
      });
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('new-connection [username] [password] [orgType]')
    .description('Adds a new deployment connection')
    .action(function(username, password, orgType){
      program.commandExecutor.execute({
        name : this._name,
        body : {
          username : username,
          password : password,
          orgType  : orgType
        }
      });
    });
};
