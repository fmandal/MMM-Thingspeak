/* global Module */

/* Magic Mirror
 * Module: MMM-Thingspeak
 *
 * By Fredrik Mandal
 * MIT Licensed.
 */

Module.register("MMM-Thingspeak", {
	defaults: {
		updateInterval: 300000,
		retryDelay: 5000,
		results: '1',
		apiUrl1: 'https://api.thingspeak.com/channels/',
		apiUrl2: '/feeds.json?api_key=',
		apiUrl3: '&results='
	},


	getScripts: function() {
		return [
			'moment.js'
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			es: "translations/es.json"
		};
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		this.sendSocketNotification('init');
		var self = this;
		this.thingspeakUrl1 = this.config.apiUrl1 + this.config.channelID1 + this.config.apiUrl2 + this.config.readAPI1 + this.config.apiUrl3 + this.config.results;
		this.thingspeakUrl2 = this.config.apiUrl1 + this.config.channelID2 + this.config.apiUrl2 + this.config.readAPI2 + this.config.apiUrl3 + this.config.results;
		this.dataFromThingspeak;
		this.returnData = {};
		this.returnChannel1;
		this.returnChannel2;
		this.returnFeed1;
		this.returnFeed2;
		this.loaded = false;
		this.scheduleUpdate(1000);
		setInterval(function() {
			self.updateDom();
		}, 1000);
	},

	getDom: function() {
		var self = this;
		var wrapper = document.createElement('div');
		if(!this.loaded){
			wrapper.innerHTML = this.translate('LOADING');
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if(this.config.header){
			var header = document.createElement('header');
			header.innerHTML = this.config.title;
			header.className = 'align-left';
			wrapper.appendChild(header);
		}

		var table = document.createElement('table');
		table.className = "xsmall";

		var channelData1 = this.returnChannel1;
		var feedData1 = this.returnFeed1;

		var r1 = document.createElement('tr');
		table.appendChild(r1);

		var f1 = document.createElement('td');
		f1.className = "align-left";
		f1.innerHTML = channelData1.description;
		r1.appendChild(f1);
		
		var f2 = document.createElement('td');
		f2.className = "align-right";
		f2.innerHTML = parseInt(feedData1[0].field1).toFixed(1) + '&deg; C';
		r1.appendChild(f2);

		var f3 = document.createElement('td');
		f3.className = "align-right";
		f3.innerHTML = parseInt(feedData1[0].field2).toFixed(1) + ' %';
		r1.appendChild(f3);

		var channelData2 = this.returnChannel2;
		var feedData2 = this.returnFeed2;

		var r2 = document.createElement('tr');
		table.appendChild(r2);

		var f4 = document.createElement('td');
		f4.className = "align-left";
		f4.innerHTML = channelData2.description;
		r2.appendChild(f4);
		
		var f5 = document.createElement('td');
		f5.className = "align-right";
		f5.innerHTML = parseInt(feedData2[0].field1).toFixed(1) + '&deg; C';
		r2.appendChild(f5);

		var f6 = document.createElement('td');
		f6.className = "align-right";
		f6.innerHTML = parseInt(feedData2[0].field2).toFixed(1) + ' %';
		r2.appendChild(f6);

		wrapper.appendChild(table);
		return wrapper;
	},

	getThingspeakData: function() {
		Log.info('Updating data now');
		this.sendSocketNotification('MMM-Thingspeak-GET_DATA', {
			config: this.config,
			thingspeakUrl1: this.thingspeakUrl1,
			thingspeakUrl2: this.thingspeakUrl2,
		});
		this.scheduleUpdate();
	},

    processData: function(obj) {
        if(obj){
        	Log.info("Processing data");
        	Log.info(obj);
            this.loaded = true;
            this.returnChannel1 = obj.feed1.channel;
            this.returnFeed1 = obj.feed1.feeds;
            this.returnChannel2 = obj.feed2.channel;
            this.returnFeed2 = obj.feed2.feeds;
            Log.info(this.returnChannel);
            Log.info(this.returnFeed);
        }
        else{
            Log.info('I have no data!');
        }
    },

	socketNotificationReceived: function(notification, payload) {
		if(notification === 'MMM-Thingspeak-RETURN_DATA') {
			Log.info('Got data!');
			Log.info(payload);
			this.processData(payload);
			this.updateDom(1000);
			}
		if(notification === 'MMM-Thingspeak-NO_DATA') {
			Log.info('No data in return');
		}
	},

	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.getThingspeakData();
		}, nextLoad);
	},


});
