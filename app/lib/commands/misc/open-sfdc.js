/**
 * @file Opens existing metadata in the Salesforce UI
 * @author Joseph Ferraro <@joeferraro>
 */

'use strict';

var Promise             = require('bluebird');
var inherits            = require('inherits');
var BaseCommand         = require('../../command');
var EditorService       = require('../../services/editor');
var logger              = require('winston');

function Command() {
  Command.super_.call(this, Array.prototype.slice.call(arguments, 0));
}

inherits(Command, BaseCommand);

Command.prototype.execute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var project = self.getProject();
    // http://docs.releasenotes.salesforce.com/en-us/winter14/release-notes/security_frontdoorjsp.htm
    var setupUrl = project.sfdcClient.getInstanceUrl() + '/secur/frontdoor.jsp?sid=' + project.sfdcClient.getAccessToken() + '&retURL=/setup/forcecomHomepage.apexp?setupid=ForceCom';
    logger.debug('attempting to open salesforce org. setupUrl is', setupUrl);
    self.editorService.openUrl(setupUrl)
      .then(function() {
        resolve('Success');
      })
      .catch(function(error) {
        reject(error);
      });
  });
};

exports.command = Command;
exports.addSubCommand = function(program) {
  program
    .command('open-sfdc')
    .description('Opens salesforce developer home page in the browser')
    .action(function(){
      program.commandExecutor.execute({
        name : this._name
      });
    });
};
