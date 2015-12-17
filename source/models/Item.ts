/**
 * Creates a new Item.
 * @class
 */
class Item {
	public Href: string;
	public Data: any;
	public Links: Array<any>;

	constructor() {
		this.Href = null;
		this.Links = null;
		this.Data = null;
	}
}