module.exports = {
  mm_workspace: {
    title: 'Workspaces',
    description: 'Array of local workspaces. These should be absolute, valid paths.',
    example: '*nix paths should include a leading slash. Windows paths should include the drive and escaped back slashes.<br/><br/>*nix Example: [ "/path/to/workspace", "/path/to/another/workspace" ]<br/>Windows Example: [ "C:\\\\some\\\\path", "C:\\\\another\\\\path" ]',
    type: 'array',
    default: [],
    order: 10
  },
  mm_api_version: {
    title: 'Salesforce API Version',
    description: 'The API version you would like to use when accessing the Salesforce APIs.',
    type: 'string',
    default: '45.0',
    order: 20
  },
  mm_compile_check_conflicts: {
    title: 'Check conflicts before compile',
    description: 'Set to true to check for conflicts when compiling Apex/Visualforce metadata.',
    type: 'boolean',
    default: true,
    order: 35
  },
  mm_download_categorized_test_logs: {
    title: 'Download categorized Apex unit test logs',
    description: 'Set to true to download Apex unit test logs to your project\'s debug/<test-name>/ directory',
    type: 'boolean',
    default: false,
    order: 36
  },
  mm_timeout: {
    title: 'Timeout, in seconds',
    description: 'Timeout (in seconds) for MavensMate commands.',
    type: 'integer',
    default: 600,
    order: 40
  },
  mm_polling_interval: {
    title: 'Polling interval, in milliseconds',
    description: 'Set to a higher number if you are consistently hitting Salesforce API limits (note: a higher polling interval means you will wait longer for compilation, deploy, and test results).',
    type: 'integer',
    default: 2000,
    order: 45
  },
  mm_default_subscription: {
    title: 'Default metadata subscription',
    description: 'Array of metadata types that should be included in every new MavensMate project, e.g. ApexClass, ApexPage, CustomObject, StaticResource',
    type: 'array',
    default: ['ApexClass', 'ApexComponent', 'ApexPage', 'ApexTrigger', 'StaticResource'],
    order: 50
  },
  mm_ignore_managed_metadata: {
    title: 'Ignore managed metadata',
    description: 'Set to true to prevent managed metadata from being downloaded to your MavensMate projects',
    type: 'boolean',
    default: true,
    order: 160
  },
  mm_use_keyring: {
    title: 'Use keyring',
    description: 'Set to true if you would like MavensMate to use your machine\'s keychain support to store/retrieve Salesforce.com credentials. If set to false, MavensMate will store passwords in plain text in your project\'s config/.settings and config/.org_connections files.',
    type: 'boolean',
    default: true,
    order: 60
  },
  mm_compile_with_tooling_api: {
    title: 'Compile Apex/Visualforce metadata with Tooling API',
    description: 'Set to true to use the tooling api to compile apex metadata (if you\'re experiencing compile issues, set this to false to use the metadata api)',
    type: 'boolean',
    default: true,
    order: 30
  },
  mm_legacy_unzip: {
    title: '(Advanced) Use your machine\'s "unzip" cli to unzip responses from Salesforce.com Metadata API',
    description: 'Set to true *ONLY* if MavensMate is having difficulty unzipping responses from the Salesforce.com Metadata API (you will have seen ENOENT/EPERM errors referencing a missing "unpackaged" directory).',
    type: 'boolean',
    default: false,
    order: 35
  },
  mm_subl_location : {
    title: 'Sublime Text location',
    description: 'The full path of your Sublime Text executable (Sublime Text users only).',
    type: 'object',
    order: 11,
    default: {
      "windows": "C:\\Program Files\\Sublime Text 3\\sublime_text.exe",
      "linux": "/usr/bin/subl",
      "osx": "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl"
    }
  },
  mm_atom_exec_path: {
    title: 'Atom executable location',
    description: 'The full path to atom executable (Atom users only).',
    type: 'object',
    default: {
      "windows": "C:\\Program Files\\Atom\\Atom.exe",
      "linux": "/usr/bin/atom",
      "osx": "/usr/local/bin/atom"
    },
    order: 150
  },
  mm_vscode_exec_path: {
    title: 'Visual Studio Code executable location',
    description: 'The full path to Visual Studio "code" executable (Visual Studio Code users only).',
    type: 'object',
    default: {
      "windows": "C:\\Program Files\\Code\\Code.exe",
      "linux": "/usr/bin/code",
      "osx": "/usr/local/bin/code"
    },
    order: 150
  },
  mm_log_location: {
    title: 'MavensMate logs location',
    description: 'Full path to the location where you would like MavensMate to store its logs. When this and mm_log_level are set, MavensMate will write logs to this path with the file name mavensmate.log. Relevant logs should be included with any bug reports.',
    type: 'string',
    default: '',
    order: 70
  },
  mm_log_level: {
    title: 'Plugin log level',
    description: 'Possible values: INFO, WARN, DEBUG, VERBOSE, SILLY',
    type: 'string',
    default: 'DEBUG',
    order: 80
  },
  mm_play_sounds: {
    title: 'Play sounds',
    description: 'Set to true if you would like MavensMate to play notification sounds on events like deployments, unit tests, etc.',
    type: 'boolean',
    default: true,
    order: 90
  },
  mm_template_location: {
    title: 'MavensMate templates location',
    description: 'Possible values: remote or local. Set to "remote" when templates should be sourced from GitHub. Set to "local" if you have cloned MavensMate-Templates locally and wish to source templates from your local file system.',
    type: 'string',
    default: 'remote',
    order: 130
  },
  mm_template_source: {
    title: 'MavensMate template source',
    description: 'If "mm_template_location" is set to "local", set this to the absolute location of the directory where you\'ve forked the MavensMate-Templates project.',
    example: '"/path/on/your/machine/to/templates"<br/>If "mm_template_location" is set to "remote", set to github location ("username/reponame/branchname"). Project structure must be in the format found here: https://github.com/MagisterAmica/MavensMate-Templates',
    type: 'string',
    default: 'MagisterAmica/MavensMate-Templates/master',
    order: 140
  },
  mm_apex_file_extensions: {
    title: 'Salesforce file extensions',
    description: 'Array of file extensions that should be considered "Salesforce" file extensions.',
    type: 'array',
    default: [".page", ".component", ".cls", ".object", ".trigger", ".layout", ".resource", ".remoteSite", ".labels", ".app", ".dashboard", ".permissionset", ".workflow", ".email", ".profile", ".scf", ".queue", ".reportType", ".report", ".weblink", ".tab", ".letter", ".role", ".homePageComponent", ".homePageLayout", ".objectTranslation", ".flow", ".datacategorygroup", ".snapshot", ".site", ".sharingRules", ".settings", ".callCenter", ".community", ".authProvider", ".customApplicationComponent", ".quickAction", ".approvalProcess", ".html"],
    order: 170
  },
  mm_http_proxy: {
    title: 'HTTP Proxy',
    description: 'Set if you are behind a proxy (you can also set via export HTTP_PROXY, export HTTPS_PROXY). Example: http:\/\/10.10.1.10:3128 or http:\/\/user:pass@10.10.1.10:3128/',
    type: 'string',
    default: '',
    order: 190
  },
  mm_https_proxy: {
    title: 'HTTPS Proxy',
    description: 'Set if you are behind a proxy (you can also set via export HTTP_PROXY, export HTTPS_PROXY). Example: http:\/\/10.10.1.10:3128 or http:\/\/user:pass@10.10.1.10:3128/',
    type: 'string',
    default: '',
    order: 200
  },
  mm_purge_on_delete: {
    title: 'Purge on delete',
    description: 'Set to true to perform a hard delete when deleting metadata.',
    type: 'boolean',
    default: true,
    order: 200
  },
  mm_legacy_compile: {
    title: 'Use legacy compile method',
    description: 'Set to true to perform a retrieve via the metadata API after Apex/VF compilation. Only set to true if you are having trouble compiling.',
    type: 'boolean',
    default: false,
    order: 210
  },
  mm_oauth_client_id: {
    title: "OAuth Client Id",
    description: "If present, overrides the built-in MaventMate client id.",
    type: 'string',
    default: '3MVG9Y6d_Btp4xp5rysauNriP6krqgj31_36WOFYeohczCzF1gjoEWkIEkAjSL_5Vef7VTM1DPBq4QJPx8.9J',
    order: 300
  }
};
