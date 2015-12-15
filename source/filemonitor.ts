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
/// <reference path="models/FilesDetails.ts" />

declare var process:any;
declare function require(name:string);

var DEFAULTCONFIGFILE: string = "config.json";
var DEBUG: boolean = true;
var PORT: number = 8080;
var BASEURI: string = "/IM/Monitor/Agent/NodeJS/Files";

var express = require("express");
var fs = require("fs");
var os = require("os");
var argv = require("minimist")(process.argv.slice(2));
var app: any = express();
var router: any = express.Router();
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

var loadFileContent = function(file) {
	try {
		return fs.readFileSync(file, 'utf8');
	}
	catch (ex) {
		console.log("Error loading configuration file '" + configFile + "'.");
		process.exit();
	}
}

var loadConfiguration = function() {
	// load configuration
	try {
		config = JSON.parse(loadFileContent(configFile));
	}
	catch (ex) {
		console.log("Error loading configuration file '" + configFile + "'.");
		process.exit();
	}
};


function compareFileInfoAsc(a: FileInfo,b: FileInfo): number {
  if (a.Time < b.Time)
    return -1;
  if (a.Time > b.Time)
    return 1;
  return 0;
}

function compareFileInfoDesc(a: FileInfo,b: FileInfo): number {
  if (a.Time < b.Time)
    return 1;
  if (a.Time > b.Time)
    return -1;
  return 0;
}




var monitor: FileMonitor = new FileMonitor();

router.get('/isalive', function (req, res) {
   	res.type("application/json");
	res.send("true");
});

router.get('/actions', function (req, res) {
	
	res.type("application/json");
	
	var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = apiresult.Collection;
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + BASEURI ;
	collection.Href = fullUrl + req.path;
	
	// oldest files action
	var oldestFilesAction: Action = new Action(
		"12012393-716f-4545-ab09-0fca87d61eb9"
		, "FilesDetailsOldest"
		, "Details (30 oldest)"
		, "Shows a list of the 30 oldest files."
		, "GET");
	
	oldestFilesAction.AddField(new Field("resourceName", "Name of the resource", "string"));
	oldestFilesAction.AddField(new Field("categoryName", "Name of the category", "string"));
	oldestFilesAction.AddField(new Field("applicationName", "Name of the application", "string"));
	
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = fullUrl + "/" + oldestFilesAction.Name;
	oldestFilesItem.Links = null;
	oldestFilesItem.Data = oldestFilesAction;
	
	collection.Items.push(oldestFilesItem);
	
	// newest files action
	var newestFilesAction: Action = new Action(
		"12000093-716f-4545-ab09-0fca87d61eb9"
		, "FilesDetailsNewest"
		, "Details (30 newest)"
		, "Shows a list of the 30 newest files."
		, "GET");
	
	newestFilesAction.AddField(new Field("resourceName", "Name of the resource", "string"));
	newestFilesAction.AddField(new Field("categoryName", "Name of the category", "string"));
	newestFilesAction.AddField(new Field("applicationName", "Name of the application", "string"));
	
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = fullUrl + "/" + newestFilesAction.Name;
	oldestFilesItem.Links = null;
	oldestFilesItem.Data = newestFilesAction;
	
	collection.Items.push(oldestFilesItem);
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
	
});

router.get('/FilesDetailsOldest', function(req, res) {
	res.type("application/json");
	
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
	
	loadConfiguration();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
	console.log("Application Id: "+ applicationId);
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	console.log("Category Id: "+ categoryId);
	
	if (DEBUG) console.log("categoryId: " + resourceName);
	
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	
	if (DEBUG) console.log("resource: " + path);
	
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
		
		
	
	var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = "";
	oldestFilesItem.Links = null;
	
	var fd: FilesDetails = new FilesDetails();
	fd.Files = files.sort(compareFileInfoAsc).slice(0, 30);
	
	oldestFilesItem.Data = fd;
	
	collection.Items.push(oldestFilesItem);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	template.data.push(loadFileContent("templates/filesList.html"));
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
});

router.get('/FilesDetailsNewest', function(req, res) {
	res.type("application/json");
	
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
	
	loadConfiguration();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	
	
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	
	
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
		
		
	
	var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var oldestFilesItem: Item = new Item();
	oldestFilesItem.Href = "";
	oldestFilesItem.Links = null;
	
	var fd: FilesDetails = new FilesDetails();
	fd.Files = files.sort(compareFileInfoDesc).slice(0, 30);
	
	oldestFilesItem.Data = fd;
	
	collection.Items.push(oldestFilesItem);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	template.data.push(loadFileContent("templates/filesList.html"));
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
});

router.get('/source', function(req, res) {
	res.type("application/json");
	
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


app.use(BASEURI, router);

var server = app.listen(PORT, function () {

  var host = server.address().address;
  var port = server.address().port;
  
  console.log("IM NodeJS File Monitor listening.")

});