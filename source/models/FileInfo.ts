/// <reference path="StatusCode.ts" />

class FileInfo {
	public Name: string;
	public FullPath: string;
	public Status: StatusCode;
	public Time: Date;
	
	public static compareFileInfoAsc = function (a: FileInfo,b: FileInfo): number {
		if (a.Time < b.Time)
			return -1;
		if (a.Time > b.Time)
			return 1;
		return 0;
	}
	
	public static compareFileInfoDesc = function (a: FileInfo,b: FileInfo): number {
		if (a.Time < b.Time)
			return 1;
		if (a.Time > b.Time)
			return -1;
		return 0;
	}
}