/// <reference path="Item.ts" />
/// <reference path="Template.ts" />
/// <reference path="Error.ts" />


class Collection {
	public Version: string;
	public Href: string;
	public Items: Array<Item>;
	public Links: any;
	public Queries: any;
	public Template: Template;
	public Pagination: any;
	public Error: ApiError;
	
	constructor() {
		this.Items = new Array<Item>();
		this.Links = null;
		this.Queries = null;
		this.Template = null;
		this.Pagination = null;
		this.Error = null;
	}
}