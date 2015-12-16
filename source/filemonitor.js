var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 0] = "OK";
    StatusCode[StatusCode["Warning"] = 1] = "Warning";
    StatusCode[StatusCode["Error"] = 2] = "Error";
    StatusCode[StatusCode["Unavailable"] = 3] = "Unavailable";
})(StatusCode || (StatusCode = {}));
/// <reference path="StatusCode.ts" />
var FileInfo = (function () {
    function FileInfo() {
    }
    FileInfo.compareFileInfoAsc = function (a, b) {
        if (a.Time < b.Time)
            return -1;
        if (a.Time > b.Time)
            return 1;
        return 0;
    };
    FileInfo.compareFileInfoDesc = function (a, b) {
        if (a.Time < b.Time)
            return 1;
        if (a.Time > b.Time)
            return -1;
        return 0;
    };
    return FileInfo;
})();
var FileTimeValidationProperty;
(function (FileTimeValidationProperty) {
    FileTimeValidationProperty[FileTimeValidationProperty["ctime"] = 0] = "ctime";
    FileTimeValidationProperty[FileTimeValidationProperty["atime"] = 1] = "atime";
    FileTimeValidationProperty[FileTimeValidationProperty["mtime"] = 2] = "mtime";
})(FileTimeValidationProperty || (FileTimeValidationProperty = {}));
/**
 * Creates a new TimeSpan.
 * @class
 */
var TimeSpan = (function () {
    /**
     * @description Constructor initializing TimeSpan.
     * @param {string} timeSpan The timespan in format d.hh:mm:ss
     * @return {TimeSpan}
     */
    function TimeSpan(timeSpan) {
        /**
         * @description Substracts the stored TimeSpan from a given date.
         * @param {Date} The date object from which to substract the TimeSpan.
         * @return {Date}
         */
        this.substractFromDate = function (date) {
            var firstSplit = this.timeSpan.split('.');
            var secondSplit = firstSplit[1].split(':');
            var days = parseInt(firstSplit[0]);
            var hours = parseInt(secondSplit[0]);
            var minutes = parseInt(secondSplit[1]);
            var seconds = parseInt(secondSplit[2]);
            var totalSecondsToSubstract = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
            var outDate = new Date(date.toString());
            return new Date(outDate.setSeconds(date.getSeconds() - totalSecondsToSubstract));
        };
        /**
         * @description Adds the stored TimeSpan to a given date.
         * @param {Date} The date object to which to add the TimeSpan.
         * @return {Date}
         */
        this.addToDate = function (date) {
            var firstSplit = this.timeSpan.split('.');
            var secondSplit = firstSplit[1].split(':');
            var days = parseInt(firstSplit[0]);
            var hours = parseInt(secondSplit[0]);
            var minutes = parseInt(secondSplit[1]);
            var seconds = parseInt(secondSplit[2]);
            var totalSecondsToSubstract = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
            var outDate = new Date(date.toString());
            return new Date(outDate.setSeconds(date.getSeconds() + totalSecondsToSubstract));
        };
        this.timeSpan = timeSpan;
    }
    return TimeSpan;
})();
/// <reference path="FileInfo.ts" />
/// <reference path="FileTimeValidationProperty.ts" />
/// <reference path="TimeSpan.ts" />
var fs = require('fs');
var FileMonitor = (function () {
    function FileMonitor() {
        this.readDirRecursively = function (dir, currentTime, warningTimeSpan, errorTimeSpan, validationTime, includeChildFolders, excludeChildFoldersList, filter) {
            if (dir[dir.length - 1] != '\\')
                dir = dir + '\\';
            var directoryContent = fs.readdirSync(dir);
            var files = new Array();
            var errorTime = errorTimeSpan.substractFromDate(currentTime);
            var warningTime = warningTimeSpan.substractFromDate(currentTime);
            for (var i = 0; i < directoryContent.length; i++) {
                var currentContent = directoryContent[i];
                var fileFullPath = dir + currentContent;
                var fileStat = fs.statSync(fileFullPath);
                if (fileStat.isDirectory() && includeChildFolders) {
                    if (excludeChildFoldersList.indexOf(currentContent) == -1)
                        files = files.concat(this.readDirRecursively(fileFullPath, currentTime, warningTimeSpan, errorTimeSpan, validationTime));
                }
                if (fileStat.isFile()) {
                    if (currentContent.search(filter) != -1) {
                        var info = new FileInfo();
                        info.Name = currentContent;
                        info.FullPath = fileFullPath;
                        info.Status = StatusCode.OK;
                        switch (validationTime) {
                            case FileTimeValidationProperty.atime:
                                info.Time = fileStat.atime;
                                break;
                            case FileTimeValidationProperty.mtime:
                                info.Time = fileStat.mtime;
                                break;
                            case FileTimeValidationProperty.ctime:
                            default:
                                info.Time = fileStat.ctime;
                                break;
                        }
                        if (info.Time < errorTime)
                            info.Status = StatusCode.Error;
                        else if (info.Time < warningTime)
                            info.Status = StatusCode.Warning;
                        if (info.Status != StatusCode.OK) {
                            files.push(info);
                        }
                    }
                }
            }
            return files;
        };
    }
    return FileMonitor;
})();
var Application = (function () {
    function Application() {
    }
    return Application;
})();
var Category = (function () {
    function Category() {
    }
    return Category;
})();
/// <reference path="StatusCode.ts" />
var Resource = (function () {
    function Resource() {
    }
    return Resource;
})();
/// <reference path="Application.ts" />
/// <reference path="Category.ts" />
/// <reference path="Resource.ts" />
var Source = (function () {
    function Source() {
        this.Applications = new Array();
        this.Resources = new Array();
        this.Categories = new Array();
    }
    return Source;
})();
/**
 * Creates a new Item.
 * @class
 */
var Item = (function () {
    function Item() {
        this.Href = null;
        this.Links = null;
    }
    return Item;
})();
var Template = (function () {
    function Template() {
        this.data = new Array();
    }
    return Template;
})();
/// <reference path="Item.ts" />
/// <reference path="Template.ts" />
var Collection = (function () {
    function Collection() {
        this.Items = new Array();
        this.Links = null;
        this.Queries = null;
        this.Template = null;
        this.Pagination = null;
        this.Error = null;
    }
    return Collection;
})();
var Field = (function () {
    /**
     * @description Constructor
     * @param {string} name The name of the Field
     * @param {string} description The description of the Field
     * @param {string} type The type of the field, e.g. string
     * @return {Field}
     */
    function Field(name, description, type) {
        this.Name = name;
        this.Description = description;
        this.Type = type;
    }
    return Field;
})();
/// <reference path="Field.ts" />
/**
 * An action is used to be executed by Integration Manager.
 */
var Action = (function () {
    /**
     * Initializes an Action.
    */
    function Action(actionId, name, displayName, description, method, fields) {
        if (fields === void 0) { fields = new Array(); }
        this.ActionId = actionId;
        this.Name = name;
        this.DisplayName = displayName;
        this.Description = description;
        this.Method = method;
        this.Fields = fields;
    }
    /**
     * Adds a field used as a parameter in the action request to this monitor agent.
    */
    Action.prototype.AddField = function (field) {
        this.Fields.push(field);
    };
    return Action;
})();
/// <reference path="Collection.ts" />
var ApiResult = (function () {
    function ApiResult() {
        this.Collection = new Collection();
    }
    return ApiResult;
})();
/// <reference path="FileInfo" />
/**
 * File Details object containing a list of files and which time property has been used for validation.
 */
var FilesDetails = (function () {
    /**
     * Creates and initiates the FilesDetails object.
     */
    function FilesDetails() {
        this.Files = new Array();
    }
    return FilesDetails;
})();
var RequestStatus = (function () {
    function RequestStatus() {
        this.IsValid = true;
        this.StatusCode = 200;
    }
    return RequestStatus;
})();
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
/// <reference path="models/RequestStatus.ts" />
var settings = require("./settings.json");
var DEFAULTCONFIGFILE = "config.json";
var DEBUG = Boolean(settings.Debug);
var PORT = parseInt(settings.Port);
var BASEURI = settings.BaseURI;
var XAPIKEYENABLED = Boolean(settings.Authentication.Enabled);
var XAPIKEY = settings.Authentication.Key;
if (DEBUG)
    console.log("Settings loaded. Debug=%s, Port=%s, BaseURI=%s, AuthenticationEnabled=%s, Key=%s", DEBUG, PORT, BASEURI, XAPIKEYENABLED, XAPIKEY);
var express = require("express");
var fs = require("fs");
var os = require("os");
var argv = require("minimist")(process.argv.slice(2));
var app = express();
var router = express.Router();
var configFile;
var config;
// parse config file from arguments, default: config.json
if (typeof argv.c == "string") {
    configFile = argv.c;
}
else {
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
var loadFileContent = function (filePath, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    try {
        return fs.readFileSync(filePath, 'utf8');
    }
    catch (ex) {
        console.log("Error loading configuration file '" + configFile + "'.");
        process.exit();
    }
};
/** Parses file content to JSON. */
var parseToJson = function () {
    // load configuration
    try {
        config = JSON.parse(loadFileContent(configFile));
    }
    catch (ex) {
        console.log("Error loading configuration file '" + configFile + "'.");
        process.exit();
    }
};
var requestIsValid = function (req) {
    var status = new RequestStatus();
    var xApiKey = req.headers["x-apikey"];
    if (XAPIKEYENABLED) {
        if (typeof xApiKey === "undefined"
            || xApiKey != XAPIKEY) {
            status.IsValid = false;
            status.StatusCode = 401;
            status.Message = "Unauthorized";
        }
    }
    return status;
};
var monitor = new FileMonitor();
router.get('/isalive', function (req, res) {
    res.type("application/json");
    var validateRequest = requestIsValid(req);
    if (!validateRequest.IsValid) {
        res.status(validateRequest.StatusCode).send(validateRequest.Message);
        return;
    }
    res.status(200).send("true");
});
router.get('/actions', function (req, res) {
    res.type("application/json");
    var validateRequest = requestIsValid(req);
    if (!validateRequest.IsValid) {
        res.status(validateRequest.StatusCode).send(validateRequest.Message);
        return;
    }
    var apiresult = new ApiResult();
    var collection = apiresult.Collection;
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + BASEURI;
    collection.Href = fullUrl + req.path;
    // oldest files action
    var oldestFilesAction = new Action("12012393-716f-4545-ab09-0fca87d61eb9", "FilesDetailsOldest", "Details (30 oldest)", "Shows a list of the 30 oldest files.", "GET");
    oldestFilesAction.AddField(new Field("resourceName", "Name of the resource", "string"));
    oldestFilesAction.AddField(new Field("categoryName", "Name of the category", "string"));
    oldestFilesAction.AddField(new Field("applicationName", "Name of the application", "string"));
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = fullUrl + "/" + oldestFilesAction.Name;
    oldestFilesItem.Links = null;
    oldestFilesItem.Data = oldestFilesAction;
    collection.Items.push(oldestFilesItem);
    // newest files action
    var newestFilesAction = new Action("12000093-716f-4545-ab09-0fca87d61eb9", "FilesDetailsNewest", "Details (30 newest)", "Shows a list of the 30 newest files.", "GET");
    newestFilesAction.AddField(new Field("resourceName", "Name of the resource", "string"));
    newestFilesAction.AddField(new Field("categoryName", "Name of the category", "string"));
    newestFilesAction.AddField(new Field("applicationName", "Name of the application", "string"));
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = fullUrl + "/" + newestFilesAction.Name;
    oldestFilesItem.Links = null;
    oldestFilesItem.Data = newestFilesAction;
    collection.Items.push(oldestFilesItem);
    apiresult.Collection = collection;
    res.send(apiresult);
});
router.get('/FilesDetailsOldest', function (req, res) {
    res.type("application/json");
    var validateRequest = requestIsValid(req);
    if (!validateRequest.IsValid) {
        res.status(validateRequest.StatusCode).send(validateRequest.Message);
        return;
    }
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    parseToJson();
    // get applicationId
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    console.log("Application Id: " + applicationId);
    // get categoryId
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    console.log("Category Id: " + categoryId);
    if (DEBUG)
        console.log("categoryId: " + resourceName);
    // get path
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("resource: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    // oldest files action
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.Files = files.sort(FileInfo.compareFileInfoAsc).slice(0, 30);
    oldestFilesItem.Data = fd;
    collection.Items.push(oldestFilesItem);
    var template = new Template();
    template.data = new Array();
    template.data.push(loadFileContent("templates/filesList.html"));
    collection.Template = template;
    apiresult.Collection = collection;
    res.send(apiresult);
});
router.get('/FilesDetailsNewest', function (req, res) {
    res.type("application/json");
    var validateRequest = requestIsValid(req);
    if (!validateRequest.IsValid) {
        res.status(validateRequest.StatusCode).send(validateRequest.Message);
        return;
    }
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    parseToJson();
    // get applicationId
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    // get categoryId
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    // get path
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    // oldest files action
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.Files = files.sort(FileInfo.compareFileInfoDesc).slice(0, 30);
    oldestFilesItem.Data = fd;
    collection.Items.push(oldestFilesItem);
    var template = new Template();
    template.data = new Array();
    template.data.push(loadFileContent("templates/filesList.html"));
    collection.Template = template;
    apiresult.Collection = collection;
    res.send(apiresult);
});
router.get('/source', function (req, res) {
    res.type("application/json");
    var validateRequest = requestIsValid(req);
    if (!validateRequest.IsValid) {
        res.status(validateRequest.StatusCode).send(validateRequest.Message);
        return;
    }
    parseToJson();
    var currentTime = new Date();
    var source = new Source();
    var applications = new Array();
    source.Applications = source.Applications.concat(config.Applications);
    source.Categories = source.Categories.concat(config.Categories);
    source.Environment = config.Settings.Environment;
    source.Version = config.Settings.Version;
    source.Server = os.hostname();
    config.Paths.forEach(function (path) {
        var resource = new Resource();
        resource.ApplicationId = path.ApplicationId;
        resource.CategoryId = path.CategoryId;
        resource.Name = path.Name;
        resource.Description = path.Description;
        resource.StatusCode = StatusCode.OK;
        resource.ErrorCode = 0;
        var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
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
                if (resource.LogText != "")
                    resource.LogText = resource.LogText + " | ";
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
    console.log("IM NodeJS File Monitor listening.");
});
