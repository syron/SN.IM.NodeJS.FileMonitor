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
/// <reference path="models/Collection.ts" />
/// <reference path="models/Field.ts" />
/// <reference path="models/Action.ts" />
/// <reference path="models/item.ts" />
/// <reference path="models/ApiResult.ts" />

declare var process:any;
declare function require(name:string);

var DEFAULTCONFIGFILE: string = "config.json";
var DEBUG: boolean = true;
var PORT: number = 8080;

var express = require("express");
var fs = require("fs");
var os = require("os");
var argv = require("minimist")(process.argv.slice(2));
var app: any = express();
var configFile: string;
var config: any;

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

var loadConfiguration = function() {
	// load configuration
	try {
		config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	}
	catch (ex) {
		console.log("Error loading configuration file '" + configFile + "'.");
		process.exit();
	}
};


var monitor: FileMonitor = new FileMonitor();

app.get('/IM/Monitor/Agent/NodeJS/Files/', function (req, res) {
   
});

app.get('/IM/Monitor/Agent/NodeJS/Files/isalive', function (req, res) {
   	res.type("application/json");
	res.send("true");
});

app.get('/IM/Monitor/Agent/NodeJS/Files/actions', function (req, res) {
	
	res.type("application/json");
	
	var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = "";
	oldestFilesItem.Links = null;
	
	var oldestFilesAction: Action = new Action();
	oldestFilesAction.ActionId = "12012393-716f-4545-ab09-0fca87d61eb9";
	oldestFilesAction.Name = "FilesDetailsOldest";
	oldestFilesAction.DisplayName = "Details (30 oldest)";
	oldestFilesAction.Description = "Shows a list of the 30 oldest files.";
	oldestFilesAction.Method = "GET";
	
	oldestFilesAction.Fields.push(new Field("resourceName", "Name of the resource", "string"));
	oldestFilesAction.Fields.push(new Field("categoryName", "Name of the category", "string"));
	oldestFilesAction.Fields.push(new Field("applicationName", "Name of the application", "string"));
	
	oldestFilesItem.Data = oldestFilesAction;
	
	collection.Items.push(oldestFilesItem);
	
	// newest files action
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = "";
	oldestFilesItem.Links = null;
	
	var oldestFilesAction: Action = new Action();
	oldestFilesAction.ActionId = "12000093-716f-4545-ab09-0fca87d61eb9";
	oldestFilesAction.Name = "FilesDetailsNewest";
	oldestFilesAction.DisplayName = "Details (30 newest)";
	oldestFilesAction.Description = "Shows a list of the 30 newest files.";
	oldestFilesAction.Method = "GET";
	
	oldestFilesAction.Fields.push(new Field("resourceName", "Name of the resource", "string"));
	oldestFilesAction.Fields.push(new Field("categoryName", "Name of the category", "string"));
	oldestFilesAction.Fields.push(new Field("applicationName", "Name of the application", "string"));
	
	oldestFilesItem.Data = oldestFilesAction;
	
	collection.Items.push(oldestFilesItem);
		
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
	
});

app.get('/IM/Monitor/Agent/NodeJS/Files/source', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	
	loadConfiguration();
	
	var currentTime = new Date();
	
	var source: Source = new Source();
	var applications: Array<Application> = new Array<Application>();
	
	source.Applications = source.Applications.concat(config.Applications);
	
	source.Categories = source.Categories.concat(config.Categories);
	source.Environment = config.Settings.Environment;
	source.Version = config.Settings.Version;
	source.Server = os.hostname();
	
	
	config.Paths.forEach(function(path) {
		var resource: Resource = new Resource();
		resource.ApplicationId = path.ApplicationId;
		resource.CategoryId = path.CategoryId;
		resource.Name = path.Name;
		resource.Description = path.Description;
		resource.StatusCode = StatusCode.OK;
		resource.ErrorCode = 0;
		
		var files = monitor.readDirRecursively(<string>path.Path
			, currentTime
			, new TimeSpan(<string>path.WarningTimeInterval)
			, new TimeSpan(<string>path.ErrorTimeInterval)
			, StatusCode[<string>path.TimeEvaluationProperty]
			, Boolean(<string>path.IncludeChildFolders)
			, path.ExcludeChildFoldersList
			, path.Filter);
		
		files.forEach(function (file) {
			if (resource.StatusCode < StatusCode.Error && file.Status == StatusCode.Error) {
				resource.StatusCode = StatusCode.Error;
				return;
			}
			else if (resource.StatusCode < StatusCode.Warning && file.Status == StatusCode.Warning) {
				resource.StatusCode = StatusCode.Warning;
				return;
			}
		});
		
		if (path.ReturnAllFileNames) {
			for (var i = 0; i < files.length; i++) {
				var file = files[i];				
				if (resource.LogText != "") resource.LogText = resource.LogText + " | ";
				resource.LogText = resource.LogText + file.FullPath;
			}
		}
		source.Resources.push(resource);
	});
	
	res.send(source);
});

var server = app.listen(PORT, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("IM NodeJS File Monitor listening at http://%s:%s", host, port)

});