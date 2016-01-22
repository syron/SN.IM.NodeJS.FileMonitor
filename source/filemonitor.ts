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
/// <reference path="models/Error.ts" />
/// <reference path="models/Field.ts" />
/// <reference path="models/Action.ts" />
/// <reference path="models/item.ts" />
/// <reference path="models/ApiResult.ts" />
/// <reference path="models/FilesDetails.ts" />
/// <reference path="models/RequestStatus.ts" />

declare var process:any;
declare function require(name:string);

var settings = require("./settings.json");

var DEFAULTCONFIGFILE: string = "config.json";
var DEBUG: boolean = Boolean(settings.Debug);
var PORT: number = parseInt(settings.Port);
var BASEURI: string = settings.BaseURI;
var XAPIKEYENABLED: boolean = Boolean(settings.Authentication.Enabled);
var XAPIKEY: string = settings.Authentication.Key;

if (DEBUG) console.log("Settings loaded. Debug=%s, Port=%s, BaseURI=%s, AuthenticationEnabled=%s, Key=%s", DEBUG, PORT, BASEURI, XAPIKEYENABLED, XAPIKEY);

var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var os = require("os");
var argv = require("minimist")(process.argv.slice(2));
var app: any = express();
var router: any = express.Router();
var configFile: string;
var config: any;

app.use(bodyParser.json());

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

/** Loads content from file - UTF8 default */
var loadFileContent = function(filePath: string, encoding: string = 'utf8') {
	try {
		return fs.readFileSync(filePath, 'utf8');
	}
	catch (ex) {
		console.log("Error loading configuration file '" + configFile + "'.");
		process.exit();
	}
}

/** Parses file content to JSON. */
var parseToJson = function() {
	// load configuration
	try {
        
        console.log(loadFileContent(configFile));
		config = JSON.parse(loadFileContent(configFile));
	}
	catch (ex) {
		console.log("Error loading configuration file '" + configFile + "'.");
        console.log(ex);
		process.exit();
	}
};


var requestIsValid = function(req) : RequestStatus {
	var status: RequestStatus = new RequestStatus();
	
	var xApiKey = req.headers["x-apikey"];
	if (XAPIKEYENABLED) {
		if (typeof xApiKey === "undefined"
			|| xApiKey != XAPIKEY)  
		{
			status.IsValid = false;
			status.StatusCode = 401;
			status.Message = "Unauthorized";
		}
	}
	
	return status;	
};



var monitor: FileMonitor = new FileMonitor();

router.get('/isalive', function (req, res) {
	res.type("application/json");
	
	res.status(200).send("true");
});

router.get('/actions', function (req, res) {
	res.type("application/json");
	
	var validateRequest: RequestStatus = requestIsValid(req);
	if (!validateRequest.IsValid) {
		
		res.status(validateRequest.StatusCode).send(validateRequest.Message);
		return;
	}
	
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
	
	var validateRequest: RequestStatus = requestIsValid(req);
	if (!validateRequest.IsValid) {
		res.status(validateRequest.StatusCode).send(validateRequest.Message);
		return;
	}
	
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
	
	parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
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
    fd.TimeEvaluationType = path.TimeEvaluationProperty;
	fd.Files = files.sort(FileInfo.compareFileInfoAsc).slice(0, 30);
    
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
	
	var validateRequest: RequestStatus = requestIsValid(req);
	if (!validateRequest.IsValid) {
		
		res.status(validateRequest.StatusCode).send(validateRequest.Message);
		return;
	}
	
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
	
	parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
    if (DEBUG)
        console.log("Category Id: " + categoryId);	
	
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
	
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
    fd.TimeEvaluationType = path.TimeEvaluationProperty;
	fd.Files = files.sort(FileInfo.compareFileInfoDesc).slice(0, 30);
	
	oldestFilesItem.Data = fd;
	
	collection.Items.push(oldestFilesItem);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	template.data.push(loadFileContent("templates/filesList.html"));
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
});

router.get('/FileDelete', function(req, res) {
	res.type("application/octet-stream");
    
    console.log("Delete request");
    
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
    var fileFullPath: string = req.query.File;
    
    parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
        
    // oldest files action
    var fileToDelete: string = "";
    var fd: string = null;
    files.forEach(function(file) {
        if (file.FullPath == fileFullPath){ 
            fileToDelete = file.FullPath;
        }
    });
    
    
    
    var apiresult: ApiResult = new ApiResult();
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	collection.Template = null;
		
	apiresult.Collection = collection;
    
    try {
        fs.accessSync(fileToDelete, fs.F_OK); 
        fs.unlinkSync(fileToDelete);
        res.status(200).send(apiresult);  
    } catch (e) {
        // It isn't accessible
        collection.Error = new ApiError();
        collection.Error.Code = "405",
        collection.Error.Title = "File not found or/and not accessible for deletion.";
        collection.Error.Message = "The requested file '" + fileFullPath + "' was not found or/and is not accessible for deletion. Please check if the file exists and/or if you have the proper access rights for deletion."
        res.status(405).send(apiresult);  
    }
});

/// Opens a specific file.
router.get('/FileDownload', function(req, res) {
	res.type("application/octet-stream");
    
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
    var fileFullPath: string = req.query.File;
    
    parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
        
    // oldest files action
    var fileToDownload: string = "";
    var fd: string = null;
    files.forEach(function(file) {
        if (file.FullPath == fileFullPath){ 
            fileToDownload = file.FullPath;
        }
    });  
    
    res.status(200).sendFile(fileToDownload);
});

router.get('/FileContent', function(req, res) {
	res.type("application/octet-stream");
    
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
    var fileFullPath: string = req.query.File;
    
    parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
        
    // loop through files to find fileName
    var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var fileContent: Item = new Item();
	fileContent.Href = "";
	fileContent.Links = null;
	
	var filecontent: any = null;
    var fd: string = null;
    files.forEach(function(file) {
        if (file.FullPath == fileFullPath){ 
            filecontent = fs.readFileSync(file.FullPath);
            fd = filecontent.toString("utf8", 0, filecontent.length);
        }
    });  
    
	fileContent.Data = { FileName: fileFullPath, Content: fd };
	
	collection.Items.push(fileContent);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	template.data.push(loadFileContent("templates/fileContent.html"));
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
});

router.post('/FileSave', function(req, res) {
    res.type("application/json");
    
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
    
    parseToJson();
    
    // get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
    
    
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
        
    // loop through files to find fileName
    var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var fileContent: Item = new Item();
	fileContent.Href = "";
	fileContent.Links = null;
	
    var foundFile: FileInfo = null;
    files.forEach(function(file) {
        if (file.FullPath == req.body.File){
            foundFile = file; 
        }
    });  
    
    
    
    var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var fileContent: Item = new Item();
		
	collection.Items.push(fileContent);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
    if (foundFile != null) {
        // write content to file.
        try {
            fs.writeFileSync(foundFile.FullPath, req.body.Content, 'utf8');
        }
        catch (ex) {
            collection.Error = new ApiError();
            collection.Error.Code = "AFS001";
            collection.Error.Message = "Could not write file '" + req.body.File + "'.";
            collection.Error.Title = "Error writing file";
            console.log("error writing file...");
        }
    }
    
	res.send(apiresult);
       
});

router.get('/FileEdit', function(req, res) {
	res.type("application/json");
    
	var resourceName: string = req.query.resourceName;
	var categoryName: string = req.query.categoryName;
	var applicationName: string = req.query.applicationName;
    var fileFullPath: string = req.query.File;
        
    parseToJson();
	
	// get applicationId
	var applicationId: number;
	config.Applications.forEach(function(application) {
		if (application.Name == applicationName) {
			applicationId = application.ApplicationId;
			return;
		}
	});
    if (DEBUG)
	   console.log("Application Id: "+ applicationId);
       
	// get categoryId
	var categoryId: number;
	config.Categories.forEach(function(category) {
		if (category.Name == categoryName) {
			categoryId = category.CategoryId;
			return;
		}
	});
	if (DEBUG) 
        console.log("Category Id: "+ categoryId);
    
	// get path
	var path: any;
	config.Paths.forEach(function(tempPath) {
		if (tempPath.ApplicationId == applicationId
			&& tempPath.CategoryId == categoryId
			&& tempPath.Name == resourceName)
			path = tempPath;
	});
	if (DEBUG) 
        console.log("Path: " + path);
	
    
	var currentTime: Date = new Date();
	
	var files = monitor.readDirRecursively(<string>path.Path
		, currentTime
		, new TimeSpan(<string>path.WarningTimeInterval)
		, new TimeSpan(<string>path.ErrorTimeInterval)
		, StatusCode[<string>path.TimeEvaluationProperty]
		, Boolean(<string>path.IncludeChildFolders)
		, path.ExcludeChildFoldersList
		, path.Filter);
        
    // loop through files to find fileName
    var apiresult: ApiResult = new ApiResult();
	
	var collection: Collection = new Collection();
	collection.Version = "1.0.0.0";
	
	var fullUrl= req.protocol + '://' + req.hostname  + ':'+ PORT + req.path;
	collection.Href = fullUrl;
	
	// oldest files action
	var fileContent: Item = new Item();
	fileContent.Href = "";
	fileContent.Links = null;
	
	var filecontent: any = null;
    var fd: string = null;
    var foundFile: FileInfo = null;
    files.forEach(function(file) {
        if (file.FullPath == fileFullPath){
            foundFile = file; 
        }
    });  
    
    filecontent = fs.readFileSync(foundFile.FullPath);
    foundFile.Content = filecontent.toString("utf8", 0, filecontent.length);
    
	fileContent.Data = foundFile;
	
	collection.Items.push(fileContent);
	
	var template:Template = new Template();
	template.data = new Array<any>(); 
	template.data.push(loadFileContent("templates/fileEdit.html"));
	
	collection.Template = template;
	
	apiresult.Collection = collection;
	
	res.send(apiresult);
});

router.get('/source', function(req, res) {
	res.type("application/json");
	
	var validateRequest: RequestStatus = requestIsValid(req);
	if (!validateRequest.IsValid) {
		
		res.status(validateRequest.StatusCode).send(validateRequest.Message);
		return;
	}
	
	parseToJson();
	
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
			if (resource.StatusCode < StatusCode.Error && file.StatusCode == StatusCode.Error) {
				resource.StatusCode = StatusCode.Error;
				return;
			}
			else if (resource.StatusCode < StatusCode.Warning && file.StatusCode == StatusCode.Warning) {
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