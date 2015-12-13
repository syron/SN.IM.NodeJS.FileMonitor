class TimeSpan {
	
	private timeSpan: string;
	
	constructor(timeSpan: string) {
		this.timeSpan = timeSpan;
	}
	
	public convert = function(date: Date) : Date {
		var firstSplit = this.timeSpan.split('.');
		var secondSplit = firstSplit[1].split(':');
		
		var days = parseInt(firstSplit[0]);
		var hours = parseInt(secondSplit[0]);
		var minutes = parseInt(secondSplit[1]);
		var seconds = parseInt(secondSplit[2]);
		
		var totalSecondsToSubstract = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
		
		var outDate = new Date(date.toString());
		return new Date(outDate.setSeconds(date.getSeconds() - totalSecondsToSubstract));
	}
	
}