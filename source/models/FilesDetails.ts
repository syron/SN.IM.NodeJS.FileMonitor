/// <reference path="FileInfo" />

/**
 * File Details object containing a list of files and which time property has been used for validation.
 */
class FilesDetails {
	/**
	 * List of files.
	 */
	public Files: Array<FileInfo>;
	/**
	 * The time evaluation type property - ctime, mtime or atime.
	 */
	public TimeEvaluationType: string;
	
	/**
	 * Creates and initiates the FilesDetails object.
	 */
	constructor() {
		this.Files = new Array<FileInfo>();
	}
}