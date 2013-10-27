(function () {

	// Defaults
	var d = {
		css : true,
		messages : true
	};

	// Subscription Widget Class
	var c = 'sendgrid-subscription-widget';

	// Shamelessly taken from Mozilla Developer Network
	// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
	// License: https://developer.mozilla.org/en-US/docs/Project:MDN/About#Copyrights_and_licenses
	var CustomEvent = function ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	};
	CustomEvent.prototype = window.CustomEvent.prototype;

	// Shamelessly taken from underscore.js
	// https://github.com/jashkenas/underscore/blob/master/underscore.js
	// License: https://github.com/jashkenas/underscore/blob/master/LICENSE

	var _keys = Object.keys || function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
		return keys;
	},

	_each = function (obj, iterator, context) {
		if (obj == null) return;
		if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, length = obj.length; i < length; i++) {
				if (iterator.call(context, obj[i], i, obj) === {}) return;
			}
		} else {
			var keys = _keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				if (iterator.call(context, obj[keys[i]], keys[i], obj) === {}) return;
			}
		}
	},

	_indexOf = function(array, item, isSorted) {
		if (array == null) return -1;
		var i = 0, length = array.length;
		if (isSorted) {
		  	if (typeof isSorted == 'number') {
				i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
			} else {
				i = _.sortedIndex(array, item);
				return array[i] === item ? i : -1;
			}
		}
		if (Array.prototype.indexOf && array.indexOf === Array.prototype.indexOf) return array.indexOf(item, isSorted);
		for (; i < length; i++) if (array[i] === item) return i;
		return -1;
	},

	_extend = function (obj) {
		_each(Array.prototype.slice.call(arguments, 1), function(source) {
			if (source) {
				for (var prop in source) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	},


	// Shamelessly taken from Quirksmode
	// http://www.quirksmode.org/js/xmlhttp.html
	// License: http://www.quirksmode.org/about/copyright.html
	sendRequest = function (url,callback,postData) {
		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method,url,true);
		if (postData)
			req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		req.onreadystatechange = function () {
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				return;
			}
			callback(req);
		}
		if (req.readyState == 4) return;
		req.send(postData);
	},

	XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	],

	createXMLHTTPObject = function () {
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
	},

	textToBool = function (textBool) {
		return (textBool === "true" || textBool === "1");
	},

	checkDefault = function (name, w, d) {
		return (w.getAttribute("data-" + name) ? textToBool(w.getAttribute("data-" + name)) : d[name]);
	},

	widgets = [];

	_each(document.getElementsByTagName("div"), function (div) {
		var classes = div.className.split(" ");

		if(_indexOf(classes, c) !== -1){
			widgets.push(div);
		}
	});

	_each(widgets, function (widget) {


		if( checkDefault("css", widget, d) && !document.getElementById(c + '-css') ){
			var css = document.createElement('link');
			css.setAttribute('id', c + '-css');
			css.setAttribute('rel', 'stylesheet');
			css.setAttribute('type', 'text/css');
			css.setAttribute('href', CSS_URL);
			document.getElementsByTagName('head')[0].appendChild(css);
		}

		var widgetInner = widget.innerHTML;
		widget.innerHTML = '';
		var form = document.createElement('form');
		
		form.innerHTML = '<div class="response"></div>' + widgetInner + '<label><span>Email</span><input type="email" name="email" placeholder="you@example.com"></label><input type="submit" value="submit">';
		widget.appendChild(form);

		var readyEvent = CustomEvent("ready", {"info" : "ready"});
		widget.dispatchEvent(readyEvent);

		var messages = {
			"Your request cannot be processed." : widget.getAttribute("data-message-processed") || "Unfortunately, an error occured. Please contact us to subscribe.",
			"The email address is invalid." : widget.getAttribute("data-message-invalid") || "The email you provided is not a valid email address. Please fix it and try again.",
			"You have subscribed to this Marketing Email." : widget.getAttribute("data-message-success") || "Thanks for subscribing."
		};

		form.addEventListener("submit", function (e) {
			widget;
			var submitData = _extend({}, e),
				submitEvent = CustomEvent("submit", submitData),
				widget = this.parentNode;
			e.stopPropagation();
			e.preventDefault();
			
			widget.dispatchEvent(submitEvent);

			var token = widget.getAttribute("data-token"),
				referrer = document.location.href,
				inputs = this.getElementsByTagName("input"),
				formValues = {};

			_each(inputs, function (input) {
				var name = input.getAttribute("name"),
					wrappedName = "SG_widget[" + name + "]";

				formValues[wrappedName] = input.value;
			});

			formValues.p = token;
			formValues.r = referrer;

			var qs = "";

			_each(formValues, function (value, name) {
				qs += "&" + name + "=" + encodeURIComponent(value);
			});

			qs = qs.substr(1);

			sendRequest('https://sendgrid.com/newsletter/addRecipientFromWidget?' + qs, function (req) {
				var responseData = JSON.parse(req.response),
					responseEventData = {
						"message" : responseData.message,
						"detail" : responseData.detail || responseData.message
					},
					responseType,
					responseEvent;
				
				var divs = widget.getElementsByTagName('div'),
					responseDiv = divs[0];
				_each(divs, function (div) {
					var classes = div.className.split(" ");

					if(_indexOf(classes, "response") !== -1){
						responseDiv = div;
					}
				});

				responseType = (responseData.success === false) ? "error" : "success";
				responseEvent = CustomEvent(responseType, responseEventData);

				if(checkDefault("messages", widget, d)){
					responseDiv.className = responseDiv.className.replace("error", "").replace("success", "") + " " + responseType;
					responseDiv.innerText = messages[responseEventData.message];
				}

				widget.dispatchEvent(responseEvent);
			});

		});
	});
})();