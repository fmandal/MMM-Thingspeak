/* Magic Mirror
 * Node Helper: MMM-Thingspeak
 *
 * By Fredrik Mandal
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require('request');
var returnData1;
var returnData2;
var ret1 = false;
var ret2 = false;
console.log("MMM-Thingspeak: Starting in node_helper");

module.exports = NodeHelper.create({
	start: function() {
		console.log("MMM-Thingspeak: Start function");
		this.config = null;
		this.thingspeakUrl1;
		this.thingspeakUrl2;

	},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		console.log("MMM-Thingspeak got request: " + notification);
		var self = this;
		if (notification === "MMM-Thingspeak-GET_DATA") {
			console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
			self.config = payload.config;
			self.thingspeakUrl1 = payload.thingspeakUrl1;
			self.thingspeakUrl2 = payload.thingspeakUrl2;
			this.getDataFromThingspeak();
		}
	},

	getDataFromThingspeak: function() {
		console.log("Getting data from Thingspeak");
		var self = this;
		console.log("Order data");
//		this.returnData1 = this.nowFetchData(this.thingspeakUrl1, "no1");
//		this.returnData2 = this.nowFetchData(this.thingspeakUrl2, "no2");
		request({url: self.thingspeakUrl1, method: 'GET'}, function(error, response, message) {
			if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
				self.returnData1 = message;
				console.log("Data 1 returnert: " + message);
				request({url: self.thingspeakUrl2, method: 'GET'}, function(error2, response2, message2) {
					if (!error2 && (response2.statusCode == 200 || response2.statusCode == 304)) {
						self.returnData2 = message2;
						console.log("Data 2 returnert: " + message2);
						console.log("Data returned: " + self.returnData1 + " *** OG *** " + self.returnData2);
						var makeJson = '{"feed1": ' + self.returnData1 + ', "feed2": ' + self.returnData2 + '}';
						console.log(makeJson);
						var returnThis = JSON.parse(makeJson);
						self.sendSocketNotification('MMM-Thingspeak-RETURN_DATA', returnThis);
					}
					else{
						console.log("Hva skjedde her?");
					}
				});
			}
		});
	},

	nowFetchData: function(fetchUrl, no){
		console.log("Actually fetching data from " + fetchUrl);
		var returnDataFromFetch;
		request({url: fetchUrl, method: 'GET'}, function(error, response, message) {
			if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
				returnDataFromFetch = message;
				if(no == "no1"){
					this.returnData1 = returnDataFromFetch;
					console.log("Data 1 returnert: " + returnDataFromFetch);
					this.ret1 = true;
				}
				else if(no == "no2"){
					this.returnData2 = returnDataFromFetch;
					console.log("Data 2 returnert: " + returnDataFromFetch);
					this.ret2 = true;
				}
				else{ console.log("Her mangler NO"); }
			}
			else{
				console.log("Hva skjedde her?");
			}
		});
	}
});