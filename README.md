# SN.IM.NodeJS.FileMonitor
File Monitor for Integration Manager based on NodeJS

## Build
To build the file monitor solution run the following command in your command prompt.

```
tsc filemonitor.ts -out filemonitor.js -removeComments
```

## How-To

### Default
```
node filemonitor.js
```

### Configuration file parameter
```
node filemonitor.js -c customConfigurationFile.json
```