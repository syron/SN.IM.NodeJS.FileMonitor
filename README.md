# SN.IM.NodeJS.FileMonitor
File Monitor for Integration Manager based on NodeJS

## API Calls
See [API.md](API.md)

## Error Codes
See [ERRORCODES.md](ERRORCODES.md)

## Build
To build the file monitor solution run the following command in your command prompt.

```
tsc filemonitor.ts -out filemonitor.js -removeComments
```

## How-To

### Actions / Remote Control

#### FilesDetailsOldest
Lists the 30 oldest files within the selected resource (folder).

#### FilesDetailsNewest
Lists the 30 newest files within the selected resource (folder).

#### FileDownload
Downloads a specific file.

### Start

#### Without configuration file as parameter
```
node filemonitor.js
```

### With configuration file as parameter
```
node filemonitor.js -c customConfigurationFile.json
```

### Configuration

```
{
	"Settings": {
		"Server": "",
		"Environment": "Dev",
		"Version": "1.0.0.0"	
	},
	"Applications": [
		{
			"ApplicationId": 1,
			"Name": "INT001",
			"Description": "Folder used for integration files on INT001."
		}
	],
	"Categories": [
		{
			"CategoryId": 1,
			"Name": "In Folder",
			"Description": ""
		},
		{
			"CategoryId": 2,
			"Name": "Out Folder",
			"Description": ""
		},
        
		{
			"CategoryId": 3,
			"Name": "Shared Folder",
			"Description": ""
		}
	],
	"Paths": [
		{
			"ApplicationId": 1,
			"CategoryId": 3,
			"Name": "Temp Folder",
			"Path": "C:\\temp\\",
			"Description": "Temp Folder",
			"IncludeChildFolders": false,
			"WarningTimeInterval": "0.00:01:00",
			"ErrorTimeInterval": "0.00:02:00",
			"ReturnAllFileNames": true,
			"ExcludeChildFoldersList": [],
			"TimeEvaluationProperty": "ctime",
			"Filter": "setup"
		}
	]
}
```