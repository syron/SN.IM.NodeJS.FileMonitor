/// <reference path="Application.ts" />
/// <reference path="Category.ts" />
/// <reference path="Resource.ts" />

class Source {
	public Server:string;
	public Environment:string;
	public Version:string;
	
	public Applications:Array<Application>;
	public Categories:Array<Category>;
	public Resources:Array<Resource>;
	
	constructor() {
		this.Applications = new Array<Application>();
		this.Resources = new Array<Resource>();
		this.Categories = new Array<Category>();
	}
}