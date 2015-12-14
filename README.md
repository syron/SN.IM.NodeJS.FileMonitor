# SN.IM.NodeJS.FileMonitor
File Monitor for Integration Manager based on NodeJS

## API Calls

```
/actions
```
Gets a list of all available actions the monitor agent has.
```
/source
```
Gets the information needed by Integration Manager used to monitor the different folders specified in the configuration file.
```
/isalive
```
Simply returns true.

## Build
To build the file monitor solution run the following command in your command prompt.

```
tsc filemonitor.ts -out filemonitor.js -removeComments
```

## How-To

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