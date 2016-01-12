/// <reference path="StatusCode.ts" />

class Resource {
	public ApplicationId: number;
	public CategoryId: number;
	public Name: string;
	public Description: string;
	public LogText: string;
	public ErrorCode: number;
	public StatusCode: StatusCode;
    
    public constructor() {
        this.LogText = "";
    }
}