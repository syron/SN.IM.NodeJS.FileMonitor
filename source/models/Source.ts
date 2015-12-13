/// <reference path="Application.ts" />
/// <reference path="Category.ts" />
/// <reference path="Resource.ts" />

class Source {
	public Name:string;
	public Description:string;
	public Applications:Array<Application>;
	public Categories:Array<Category>;
	public Resources:Array<Resource>;
	
	constructor(name:  string, description: string) {
		this.Name = name;
		this.Description = description;
		this.Applications = new Array<Application>();
		this.Resources = new Array<Resource>();
		this.Categories = new Array<Category>();
	}
}