var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 0] = "OK";
    StatusCode[StatusCode["Warning"] = 1] = "Warning";
    StatusCode[StatusCode["Error"] = 2] = "Error";
    StatusCode[StatusCode["Unavailable"] = 3] = "Unavailable";
})(StatusCode || (StatusCode = {}));
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
var TimeSpan = (function () {
    function TimeSpan(timeSpan) {
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
                        info.EncodedFullPath = info.FullPath.replace(/\\/g, "\\\\");
                        info.StatusCode = StatusCode.OK;
                        info.Status = "OK";
                        info.Size = (Math.round((fileStat.size / 1024) * 100) / 100).toFixed(2);
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
                        if (info.Time < errorTime) {
                            info.StatusCode = StatusCode.Error;
                            info.Status = "Error";
                        }
                        else if (info.Time < warningTime) {
                            info.StatusCode = StatusCode.Warning;
                            info.Status = "Warning";
                        }
                        if (info.StatusCode != StatusCode.OK) {
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
var Resource = (function () {
    function Resource() {
        this.LogText = "";
    }
    return Resource;
})();
var Source = (function () {
    function Source() {
        this.Applications = new Array();
        this.Resources = new Array();
        this.Categories = new Array();
    }
    return Source;
})();
var Item = (function () {
    function Item() {
        this.Href = null;
        this.Links = null;
        this.Data = null;
    }
    return Item;
})();
var Template = (function () {
    function Template() {
        this.data = new Array();
    }
    return Template;
})();
var ApiError = (function () {
    function ApiError() {
    }
    return ApiError;
})();
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
    function Field(name, description, type) {
        this.Name = name;
        this.Description = description;
        this.Type = type;
    }
    return Field;
})();
var Action = (function () {
    function Action(actionId, name, displayName, description, method, fields) {
        if (fields === void 0) { fields = new Array(); }
        this.ActionId = actionId;
        this.Name = name;
        this.DisplayName = displayName;
        this.Description = description;
        this.Method = method;
        this.Fields = fields;
    }
    Action.prototype.AddField = function (field) {
        this.Fields.push(field);
    };
    return Action;
})();
var ApiResult = (function () {
    function ApiResult() {
        this.Collection = new Collection();
    }
    return ApiResult;
})();
var FilesDetails = (function () {
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
var PostStatus = (function () {
    function PostStatus() {
    }
    return PostStatus;
})();
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
var bodyParser = require("body-parser");
var fs = require("fs");
var os = require("os");
var path = require('path');
var mime = require('mime');
var argv = require("minimist")(process.argv.slice(2));
var app = express();
var router = express.Router();
var configFile;
var config;
app.use(bodyParser.json());
if (typeof argv.c == "string") {
    configFile = argv.c;
}
else {
    configFile = DEFAULTCONFIGFILE;
}
if (DEBUG)
    console.log("Configuration file set to " + configFile + ".");
try {
    var fileinfo = fs.statSync(configFile);
}
catch (ex) {
    console.log("Configuration file not found. Exiting, please start using -config parameter.");
    console.log("Example: node filemonitor.js -config " + configFile);
    process.exit();
}
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
var parseToJson = function () {
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
    var oldestFilesAction = new Action("12012393-716f-4545-ab09-0fca87d61eb9", "FilesDetailsOldest", "Details (30 oldest)", "Shows a list of the 30 oldest files.", "GET");
    oldestFilesAction.AddField(new Field("resourceName", "Name of the resource", "string"));
    oldestFilesAction.AddField(new Field("categoryName", "Name of the category", "string"));
    oldestFilesAction.AddField(new Field("applicationName", "Name of the application", "string"));
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = fullUrl + "/" + oldestFilesAction.Name;
    oldestFilesItem.Links = null;
    oldestFilesItem.Data = oldestFilesAction;
    collection.Items.push(oldestFilesItem);
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
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.TimeEvaluationType = path.TimeEvaluationProperty;
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
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.TimeEvaluationType = path.TimeEvaluationProperty;
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
router.get('/FileDelete', function (req, res) {
    res.type("application/octet-stream");
    console.log("Delete request");
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    var fileFullPath = req.query.File;
    parseToJson();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var fileToDelete = "";
    var fd = null;
    files.forEach(function (file) {
        if (file.FullPath == fileFullPath) {
            fileToDelete = file.FullPath;
        }
    });
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    collection.Template = null;
    apiresult.Collection = collection;
    try {
        fs.accessSync(fileToDelete, fs.F_OK);
        fs.unlinkSync(fileToDelete);
        res.status(200).send(apiresult);
    }
    catch (e) {
        collection.Error = new ApiError();
        collection.Error.Code = "405",
            collection.Error.Title = "File not found or/and not accessible for deletion.";
        collection.Error.Message = "The requested file '" + fileFullPath + "' was not found or/and is not accessible for deletion. Please check if the file exists and/or if you have the proper access rights for deletion.";
        res.status(405).send(apiresult);
    }
});
router.get('/FileDownload', function (req, res) {
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    var fileFullPath = req.query.identifier;
    console.log(fileFullPath);
    parseToJson();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    if (typeof fileFullPath !== "undefined" && fileFullPath != null && fileFullPath != "") {
        var mimetype = mime.lookup(fileFullPath);
        res.setHeader('Content-type', mimetype);
        var splittedFileName = fileFullPath.split("\\");
        var filename = splittedFileName[splittedFileName.length - 1];
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        var filestream = fs.createReadStream(fileFullPath);
        filestream.pipe(res);
    }
    else {
        res.send(400);
    }
});
router.get('/FileContent', function (req, res) {
    res.type("application/octet-stream");
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    var fileFullPath = req.query.File;
    parseToJson();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var fileContent = new Item();
    fileContent.Href = "";
    fileContent.Links = null;
    var filecontent = null;
    var fd = null;
    files.forEach(function (file) {
        if (file.FullPath == fileFullPath) {
            filecontent = fs.readFileSync(file.FullPath);
            fd = filecontent.toString("utf8", 0, filecontent.length);
        }
    });
    fileContent.Data = { FileName: fileFullPath, Content: fd };
    collection.Items.push(fileContent);
    var template = new Template();
    template.data = new Array();
    template.data.push(loadFileContent("templates/fileContent.html"));
    collection.Template = template;
    apiresult.Collection = collection;
    res.send(apiresult);
});
router.post('/FileSave', function (req, res) {
    res.type("application/json");
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    parseToJson();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var fileContent = new Item();
    fileContent.Href = "";
    fileContent.Links = null;
    var foundFile = null;
    files.forEach(function (file) {
        if (file.FullPath == req.body.File) {
            foundFile = file;
        }
    });
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var status = new PostStatus();
    var result = new Item();
    result.Data = status;
    collection.Items.push(fileContent);
    if (foundFile != null) {
        try {
            fs.writeFileSync(foundFile.FullPath, req.body.Content, 'utf8');
            status.Success = true;
            status.Message = "Content has been saved to file '" + req.body.File + "'.";
        }
        catch (ex) {
            status.Success = false;
            status.Message = "";
            collection.Error = new ApiError();
            collection.Error.Code = "AFS001";
            collection.Error.Message = "Could not write file '" + req.body.File + "'.";
            collection.Error.Title = "Error writing file";
        }
    }
    var template = new Template();
    template.data = new Array();
    collection.Template = template;
    apiresult.Collection = collection;
    res.send(apiresult);
});
router.get('/FileEdit', function (req, res) {
    res.type("application/json");
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    var fileFullPath = req.query.File;
    parseToJson();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    if (DEBUG)
        console.log("Application Id: " + applicationId);
    var categoryId;
    config.Categories.forEach(function (category) {
        if (category.Name == categoryName) {
            categoryId = category.CategoryId;
            return;
        }
    });
    if (DEBUG)
        console.log("Category Id: " + categoryId);
    var path;
    config.Paths.forEach(function (tempPath) {
        if (tempPath.ApplicationId == applicationId
            && tempPath.CategoryId == categoryId
            && tempPath.Name == resourceName)
            path = tempPath;
    });
    if (DEBUG)
        console.log("Path: " + path);
    var currentTime = new Date();
    var files = monitor.readDirRecursively(path.Path, currentTime, new TimeSpan(path.WarningTimeInterval), new TimeSpan(path.ErrorTimeInterval), StatusCode[path.TimeEvaluationProperty], Boolean(path.IncludeChildFolders), path.ExcludeChildFoldersList, path.Filter);
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var fileContent = new Item();
    fileContent.Href = "";
    fileContent.Links = null;
    var filecontent = null;
    var fd = null;
    var foundFile = null;
    files.forEach(function (file) {
        if (file.FullPath == fileFullPath) {
            foundFile = file;
        }
    });
    filecontent = fs.readFileSync(foundFile.FullPath);
    foundFile.Content = filecontent.toString("utf8", 0, filecontent.length);
    fileContent.Data = foundFile;
    collection.Items.push(fileContent);
    var template = new Template();
    template.data = new Array();
    template.data.push(loadFileContent("templates/fileEdit.html"));
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
