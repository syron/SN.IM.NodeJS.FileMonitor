/**
 * Creates a new TimeSpan.
 * @class
 */
class TimeSpan {
	
	/**
	 * The Timespan
	 * @type {string}
	 */
	private timeSpan: string;
	
	/**
	 * @description Constructor initializing TimeSpan.
	 * @param {string} timeSpan The timespan in format d.hh:mm:ss
	 * @return {TimeSpan} 
	 */
	constructor(timeSpan: string) {
		this.timeSpan = timeSpan;
	}
	
	/**
	 * @description Substracts the stored TimeSpan from a given date.
	 * @param {Date} The date object from which to substract the TimeSpan.
	 * @return {Date}
	 */
	public substractFromDate = function(date: Date) : Date {
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
	
	/**
	 * @description Adds the stored TimeSpan to a given date.
	 * @param {Date} The date object to which to add the TimeSpan.
	 * @return {Date}
	 */
	public addToDate = function(date: Date) : Date {
		var firstSplit = this.timeSpan.split('.');
		var secondSplit = firstSplit[1].split(':');
		
		var days = parseInt(firstSplit[0]);
		var hours = parseInt(secondSplit[0]);
		var minutes = parseInt(secondSplit[1]);
		var seconds = parseInt(secondSplit[2]);
		
		var totalSecondsToSubstract = seconds + (minutes * 60) + (hours * 60 * 60) + (days * 24 * 60 * 60);
		
		var outDate = new Date(date.toString());
		return new Date(outDate.setSeconds(date.getSeconds() + totalSecondsToSubstract));
	}
}