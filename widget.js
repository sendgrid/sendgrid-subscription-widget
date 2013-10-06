(function () {

	var SendGridWidget = {};
	SendGridWidget.handlers = {};

	// Intialize the available events
	var events = ["ready", "success", "error"];
	for (var i = 0; i < events.length; i++) {
		var eventName = events[i];
		SendGridWidget.handlers[eventName] = [];
	};

	SendGridWidget.prototype.on = function (eventName, func) {
		var events = eventName.toString().split(/\s/g);
		for (var i = 0; i < events.length; i++) {
			eventName = events[i].toLowerCase();
			if (this.handlers[eventName]) this.handlers[eventName].push(func);
		}
	};

	SendGridWidget.prototype.trigger = function (eventName) {
		for (var i = 0; i < this[eventName].length; i++) {
			this.handlers[eventName][i]();
		}
	};


	SendGridWidget.prototype._resolveDefaults = function (options) {
		return SendGridWidget.prototype._extend(
			{
				'css' : true,
				'messages' : true
			},
			options
		);
	};


	SendGridWidget.prototype._loadWidget = function (options) {
		if (options.css) {
			var css = document.createElement('link');
			css.setAttribute('rel', 'stylesheet');
			css.setAttribute('type', 'text/css');
			css.setAttribute('href', 'css/my.css');
			document.getElementsByTagName('head')[0].appendChild(css);
		}
	};

	// Shamelessly taken from underscore.js
	// https://github.com/jashkenas/underscore/blob/dc3efb2aa4016af06e12f2c4c9abc776e239d41b/underscore.js#L823-L833
	// License: https://github.com/jashkenas/underscore/blob/master/LICENSE
	SendGridWidget.prototype._extend = function(obj) {
		var extending = Array.prototype.slice.call(arguments, 1);
		for (var i = 0, length = extending.length; i < length; i++) {
			var source = extending[i];
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	};

	// Shamelessly taken from Quirksmode
	// http://www.quirksmode.org/js/xmlhttp.html
	// License: http://www.quirksmode.org/about/copyright.html
	SendGridWidget.prototype._ajax = {
		sendRequest : function (url,callback,postData) {
			var req = createXMLHTTPObject();
			if (!req) return;
			var method = (postData) ? "POST" : "GET";
			req.open(method,url,true);
			req.setRequestHeader('User-Agent','XMLHTTP/1.0');
			if (postData)
				req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
			req.onreadystatechange = function () {
				if (req.readyState != 4) return;
				if (req.status != 200 && req.status != 304) {
					return;
				}
				callback(req);
			};
			if (req.readyState == 4) return;
			req.send(postData);
		},

		XMLHttpFactories : [
			function () {return new XMLHttpRequest()},
			function () {return new ActiveXObject("Msxml2.XMLHTTP")},
			function () {return new ActiveXObject("Msxml3.XMLHTTP")},
			function () {return new ActiveXObject("Microsoft.XMLHTTP")}
		],

		createXMLHTTPObject : function () {
			var xmlhttp = false;
			for (var i=0;i<XMLHttpFactories.length;i++) {
				try {
					xmlhttp = XMLHttpFactories[i]();
				}
				catch (e) {
					continue;
				}
				break;
			}
			return xmlhttp;
		}
	};

})();