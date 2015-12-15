/// <reference path="Field.ts" />

/**
 * An action is used to be executed by Integration Manager.
 */
class Action {
	public ActionId: string;
	public Name: string;
	public DisplayName: string;
	public Description: string;
	public Method: string;
	public Fields: Array<Field>;
	
	/** 
	 * Initializes an Action.
	*/
	constructor(actionId: string, name: string, displayName: string, description: string, method: string, fields: Array<Field> = new Array<Field>()) {
		this.ActionId = actionId;
		this.Name = name;
		this.DisplayName = displayName;
		this.Description = description;
		this.Method = method;
		this.Fields = fields;
	}
	
	/** 
	 * Adds a field used as a parameter in the action request to this monitor agent.
	*/
	public AddField(field: Field) {
		this.Fields.push(field);
	}
}

