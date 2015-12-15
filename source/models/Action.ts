/// <reference path="Field.ts" />

class Action {
	public ActionId: string;
	public Name: string;
	public DisplayName: string;
	public Description: string;
	public Method: string;
	public Fields: Array<Field>;
	
	/** @description Constructor initializing the Action with all required properties.
	* @param {string} actionId A unique identifier for this action of type GUID.
	* @param {string} name The name of the action.
	* @param {string} displayName The name to display in Integration Manager.
	* @param {string} description The description of this action for improving the UX (User Experience)
	* @param {string} method The HTTP verb used to execute the action. (Available methods are: GET, POST, PUT, DELETE).
	* @param {Array<Field>} fields Fields used when executing the actions. These fields are used as parameters.
	* @return {Action}
	*/
	constructor(actionId: string, name: string, displayName: string, description: string, method: string, fields: Array<Field> = new Array<Field>()) {
		this.ActionId = actionId;
		this.Name = name;
		this.DisplayName = displayName;
		this.Description = description;
		this.Method = method;
		this.Fields = fields;
	}
	
	/** @description Adds a field used as a parameter in the action request to this monitor agent.
	* @param {Field} field The field used as a paremeter.
	* @return {void}
	*/
	public AddField(field: Field) {
		this.Fields.push(field);
	}
}