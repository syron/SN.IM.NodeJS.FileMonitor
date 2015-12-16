class RequestStatus {
	public IsValid: boolean;
	public StatusCode: number;
	public Message: string;
	
	constructor() {
		this.IsValid = true;
		this.StatusCode = 200;
	}
}