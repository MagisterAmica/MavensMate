/**
 * @file Lists projects in all workspaces
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var ViewHelper        = require('../../../helper');
var BaseCommand       = require('../../command');
var inherits          = require('inherits');
var logger            = require('winston');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    try {
      var v = new ViewHelper();
      resolve(v.listProjects());
    } catch(e) {
      reject(e);
    }
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('list-projects')
    .description('List projects in all workspaces')
    .action(function() {
      program.commandExecutor.execute({
        name : this._name
      });
    });
};
