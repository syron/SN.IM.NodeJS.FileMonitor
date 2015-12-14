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
        this.convert = function (date) {
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
            var errorTime = errorTimeSpan.convert(currentTime);
            var warningTime = warningTimeSpan.convert(currentTime);
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
var Resource = (function () {
    function Resource() {
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
    }
    return Item;
})();
var Template = (function () {
    function Template() {
        this.data = new Array();
    }
    return Template;
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
    function Action() {
        this.Fields = new Array();
    }
    return Action;
})();
var ApiResult = (function () {
    function ApiResult() {
        this.Collection = null;
    }
    return ApiResult;
})();
var FilesDetails = (function () {
    function FilesDetails() {
        this.Files = new Array();
    }
    return FilesDetails;
})();
var DEFAULTCONFIGFILE = "config.json";
var DEBUG = true;
var PORT = 8080;
var express = require("express");
var fs = require("fs");
var os = require("os");
var argv = require("minimist")(process.argv.slice(2));
var app = express();
var router = express.Router();
var configFile;
var config;
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
var loadFileContent = function (file) {
    try {
        return fs.readFileSync(file, 'utf8');
    }
    catch (ex) {
        console.log("Error loading configuration file '" + configFile + "'.");
        process.exit();
    }
};
var loadConfiguration = function () {
    try {
        config = JSON.parse(loadFileContent(configFile));
    }
    catch (ex) {
        console.log("Error loading configuration file '" + configFile + "'.");
        process.exit();
    }
};
function compareFileInfoAsc(a, b) {
    if (a.Time < b.Time)
        return -1;
    if (a.Time > b.Time)
        return 1;
    return 0;
}
function compareFileInfoDesc(a, b) {
    if (a.Time < b.Time)
        return 1;
    if (a.Time > b.Time)
        return -1;
    return 0;
}
var monitor = new FileMonitor();
router.get('/isalive', function (req, res) {
    res.type("application/json");
    res.send("true");
});
router.get('/actions', function (req, res) {
    res.type("application/json");
    var apiresult = new ApiResult();
    var collection = new Collection();
    collection.Version = "1.0.0.0";
    var fullUrl = req.protocol + '://' + req.hostname + ':' + PORT + req.path;
    collection.Href = fullUrl;
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var oldestFilesAction = new Action();
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
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var oldestFilesAction = new Action();
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
router.get('/FilesDetailsOldest', function (req, res) {
    res.type("application/json");
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    loadConfiguration();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    console.log("Application Id: " + applicationId);
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
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.Files = files.sort(compareFileInfoAsc).slice(0, 30);
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
    var resourceName = req.query.resourceName;
    var categoryName = req.query.categoryName;
    var applicationName = req.query.applicationName;
    loadConfiguration();
    var applicationId;
    config.Applications.forEach(function (application) {
        if (application.Name == applicationName) {
            applicationId = application.ApplicationId;
            return;
        }
    });
    console.log("Application Id: " + applicationId);
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
    var oldestFilesItem = new Item();
    oldestFilesItem.Href = "";
    oldestFilesItem.Links = null;
    var fd = new FilesDetails();
    fd.Files = files.sort(compareFileInfoDesc).slice(0, 30);
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
    loadConfiguration();
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
app.use('/IM/Monitor/Agent/NodeJS/Files', router);
var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("IM NodeJS File Monitor listening at http://%s:%s", host, port);
});
