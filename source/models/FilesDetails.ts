/// <reference path="FileInfo" />

class FilesDetails {
	public Files: Array<FileInfo>;
	public TimeEvaluationType: string;
	
	constructor() {
		this.Files = new Array<FileInfo>();
	}
}