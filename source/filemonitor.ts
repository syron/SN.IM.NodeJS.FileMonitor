/// <reference path="defintionFiles/node.d.ts" />
/// <reference path="models/StatusCode.ts" />
/// <reference path="models/FileInfo.ts" />
/// <reference path="models/FileTimeValidationProperty.ts" />
/// <reference path="models/TimeSpan.ts" />
/// <reference path="models/FileMonitor.ts" />
/// <reference path="models/Application.ts" />
/// <reference path="models/Category.ts" />
/// <reference path="models/Source.ts" />
/// <reference path="models/Resource.ts" />

declare var process:any;
declare function require(name:string);

var DEFAULTCONFIGFILE: string = "config.json";
var DEBUG: boolean = true;

var fs = require("fs");
var argv = require("minimist")(process.argv.slice(2));
var configFile: string;

// parse config file from arguments, default: config.json
if (typeof argv.c == "string") {
	configFile = argv.c;
} else {
	configFile = DEFAULTCONFIGFILE;	
}

if (DEBUG)
	console.log("Configuration file set to " + configFile + ".");

// checks if file exists.
try {
	var fileinfo = fs.statSync(configFile);
}
catch (ex) {
	console.log("Configuration file not found. Exiting, please start using -config parameter.");
	console.log("Example: node filemonitor.js -config " + configFile);
	process.exit();
}

var source:Source = new Source("File Monitor", "NodeJS File Monitor");

var resource:Resource = new Resource();
resource.Name = "Folder C:\\temp";
resource.Description = "Temp folder on C";
resource.StatusCode = StatusCode.OK;
resource.ApplicationId = 1;
resource.CategoryId = 1;
resource.ErrorCode = 0;
resource.LogText = "";

source.Resources.push(resource);

var monitor: FileMonitor = new FileMonitor();
var currentTime: Date = new Date();

var files = monitor.readDirRecursively("C:\\temp"
	, currentTime
	, new TimeSpan("0.00:01:00")
	, new TimeSpan("0.00:02:00")
	, FileTimeValidationProperty.ctime
	, true
	, new Array<string>()
	, "");