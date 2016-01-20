/// <reference path="FileInfo.ts" />
/// <reference path="FileTimeValidationProperty.ts" />
/// <reference path="TimeSpan.ts" />

declare function require(name:string);
var fs = require('fs');

class FileMonitor {
	private folder: string;
		
	public readDirRecursively  = function (dir: string, currentTime: Date, warningTimeSpan: TimeSpan, errorTimeSpan: TimeSpan, validationTime: FileTimeValidationProperty, includeChildFolders: boolean, excludeChildFoldersList: Array<string>, filter: string) : Array<FileInfo> {
		if (dir[dir.length-1] != '\\')
			dir = dir + '\\';
		
		var directoryContent = fs.readdirSync(dir);
		
		var files: Array<FileInfo> = new Array<FileInfo>();
		
		var errorTime: Date = errorTimeSpan.substractFromDate(currentTime);
		var warningTime: Date = warningTimeSpan.substractFromDate(currentTime);
		
		for (var i = 0; i < directoryContent.length; i++) {
			var currentContent = directoryContent[i];
			var fileFullPath = dir + currentContent;
			var fileStat = fs.statSync(fileFullPath);
			
			if (fileStat.isDirectory() && includeChildFolders) {
				if (excludeChildFoldersList.indexOf(currentContent) == -1)
					files = files.concat(this.readDirRecursively(fileFullPath, currentTime, warningTimeSpan, errorTimeSpan, validationTime));
			}
			if (fileStat.isFile()) {
				if(currentContent.search(filter) != -1) {
					
					var info: FileInfo = new FileInfo();
					info.Name = currentContent;
					info.FullPath = fileFullPath;
                    info.EncodedFullPath = info.FullPath.replace(/\\/g, "\\\\");
					info.StatusCode = StatusCode.OK;
                    info.Status = "OK"
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
	}
}