/**
 * @file Executes an apex script anonymously
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var BaseCommand       = require('../../command');
var inherits          = require('inherits');
var ApexScriptService = require('../../services/apex-script');
var util              = require('../../util');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var apexScriptService = new ApexScriptService(self.getProject());
    apexScriptService.execute(self.payload.paths)
      .then(function(result) {
        resolve(result);
      })
      .catch(function(error) {
        reject(error);
      });
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('run-apex-script [scriptPath]')
    .alias('execute-apex-script')
    .description('Executes an apex script')
    .action(function(scriptPath){
      if (scriptPath) {
        program.commandExecutor.execute({
          name : this._name,
          body : { paths: util.getAbsolutePaths( [ scriptPath ] ) }
        });
      } else {
        console.error('Please specify a valid script path');
        process.exit(1);
      }
    });
};
