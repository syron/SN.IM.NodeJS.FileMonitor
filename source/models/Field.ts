class Field {
	public Name: string;
	public Description: string;
	public Type: string;
	
	/**
	 * @description Constructor
	 * @param {string} name The name of the Field
	 * @param {string} description The description of the Field
	 * @param {string} type The type of the field, e.g. string
	 * @return {Field}
	 */
	constructor(name: string, description: string, type: string) {
		this.Name = name;
		this.Description = description;
		this.Type = type;
	}
}