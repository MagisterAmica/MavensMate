var path            = require('path');
var util            = require('../util');
var logger          = require('winston');
var _               = require('lodash');
var capitalize      = require('../utilities/capitalize');
var camelize        = require('../utilities/camelize');
var EditorService   = require('../services/editor');

var commands = {};
var cmdPath = path.join(__dirname);
var commandFiles = util.walkSync(cmdPath);
_.each(commandFiles, function (filepath) {
  console.log(capitalize(camelize(path.basename(filepath).split('.')[0])+'Command'));
  commands[capitalize(camelize(path.basename(filepath).split('.')[0])+'Command')] = require(filepath).command;
});

/**
 * Responses to the client that executed the command
 * @param  {Object|String} res   - response from the command
 * @param  {Boolean} success - whether the command was successfull (TODO: do we need this?)
 * @param  {Error} error   - error instance (for failed commands)
 * @return {String|Object|STDOUT}         - depends on the configuration of the client (more documentation needed here)
 */
function _handleCommandResult(result) {
  logger.info('handling command result');
  if (result.result) {
    logger.debug(result.result);
  } else if (result.error) {
    logger.error(result.error);
  }

  if (result.error) {
    result.reject(result.error);
  } else {
    if (_.isString(result.result)) {
      var response = {
        message : result.result,
      };
      result.resolve(response);
    } else {
      result.resolve(result.result);
    }
  }
}

/**
 * Command executor
 * @param  {Object} opts
 * @param  {Function} opts.openWindowFn - js function used to open a UI
 * @param  {Function} opts.project - project instance
 * @return {Function}
 */
module.exports = function (opts) {

  opts = opts || {};

  return {
    /**
     * Executes a command
     * @param  {Object}   payload - object containing the following:
     * @param  {String}   payload.name  - name of the command, e.g. new-project
     * @param  {String}   payload.body  - arbitrary body of the command, e.g. { username: foo, password: bar } }
     * @param  {String}   payload.project  - project instance or project id
     * @param  {String}   payload.editor  - name of the editor, e.g. sublime, vscode, atom
     * @param  {Function} payload.callback - callback, will be called when command finishes executing
     * @return {Nothing}
     */
    execute : function (payload) {
      return new Promise(function (resolve, reject) {
        try {
          logger.info(`\n\n==================> executing command ${payload.name}`);
          // logger.silly('payload ', payload);

          var name, body, editor, project, openWindowFn, commandClassName;
          name = payload.name;
          body = payload.body;
          editor = payload.editor || process.env.MAVENSMATE_EDITOR;
          project = payload.project || opts.project;
          openWindowFn = payload.openWindowFn || opts.openWindowFn;

          logger.info('name: ', name);
          logger.info('project: ', project && project.name ? project.name : 'none');
          logger.info('body: ', JSON.stringify(body));
          logger.info('editor: ', editor || 'none');

          commandClassName = capitalize(camelize(name))+'Command'; // => new-project -> NewProjectCommand

          logger.debug('mavensmate command class name: '+commandClassName);

          var editorService = new EditorService(editor, openWindowFn);

          var command = new commands[commandClassName](project, body, editorService);

          logger.silly('mavensmate command instance: ', command);

          if (!commands[commandClassName]) {
            _handleCommandResult({
              error   : new Error('Command not supported: '+name),
              resolve : resolve,
              reject  : reject,
            });
            return;
          }

          command.execute()
            .then(function (result) {
              _handleCommandResult({
                result  : result,
                resolve : resolve,
                reject  : reject,
              });
            })
            .catch(function (error) {
              _handleCommandResult({
                error   : error,
                resolve : resolve,
                reject  : reject,
              });
            });
        } catch(e) {
          logger.error(e);
          _handleCommandResult(e);
        }
      });
    },
  };
};
