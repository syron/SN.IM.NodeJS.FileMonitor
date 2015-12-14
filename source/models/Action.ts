/// <reference path="Field.ts" />

class Action {
	public ActionId: string;
	public Name: string;
	public DisplayName: string;
	public Description: string;
	public Method: string;
	public Fields: Array<Field>;
	
	constructor() {
		this.Fields = new Array<Field>();
	}
}