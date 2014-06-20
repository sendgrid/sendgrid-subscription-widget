//safe JSON parsing code, for IE7
//https://code.google.com/p/json-sans-eval/
var jsonParse = (function () {
	var number
			= '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
	var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]'
			+ '|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
	var string = '(?:\"' + oneChar + '*\")';

	// Will match a value in a well-formed JSON file.
	// If the input is not well-formed, may match strangely, but not in an unsafe
	// way.
	// Since this only matches value tokens, it does not match whitespace, colons,
	// or commas.
	var jsonToken = new RegExp(
			'(?:false|true|null|[\\{\\}\\[\\]]'
			+ '|' + number
			+ '|' + string
			+ ')', 'g');

	// Matches escape sequences in a string literal
	var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');

	// Decodes escape sequences in object literals
	var escapes = {
		'"': '"',
		'/': '/',
		'\\': '\\',
		'b': '\b',
		'f': '\f',
		'n': '\n',
		'r': '\r',
		't': '\t'
	};
	function unescapeOne(_, ch, hex) {
		return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
	}

	// A non-falsy value that coerces to the empty string when used as a key.
	var EMPTY_STRING = new String('');
	var SLASH = '\\';

	// Constructor to use based on an open token.
	var firstTokenCtors = { '{': Object, '[': Array };

	var hop = Object.hasOwnProperty;

	return function (json, opt_reviver) {
		// Split into tokens
		var toks = json.match(jsonToken);
		// Construct the object to return
		var result;
		var tok = toks[0];
		var topLevelPrimitive = false;
		if ('{' === tok) {
			result = {};
		} else if ('[' === tok) {
			result = [];
		} else {
			// The RFC only allows arrays or objects at the top level, but the JSON.parse
			// defined by the EcmaScript 5 draft does allow strings, booleans, numbers, and null
			// at the top level.
			result = [];
			topLevelPrimitive = true;
		}

		// If undefined, the key in an object key/value record to use for the next
		// value parsed.
		var key;
		// Loop over remaining tokens maintaining a stack of uncompleted objects and
		// arrays.
		var stack = [result];
		for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
			tok = toks[i];

			var cont;
			switch (tok.charCodeAt(0)) {
				default:  // sign or digit
					cont = stack[0];
					cont[key || cont.length] = +(tok);
					key = void 0;
					break;
				case 0x22:  // '"'
					tok = tok.substring(1, tok.length - 1);
					if (tok.indexOf(SLASH) !== -1) {
						tok = tok.replace(escapeSequence, unescapeOne);
					}
					cont = stack[0];
					if (!key) {
						if (cont instanceof Array) {
							key = cont.length;
						} else {
							key = tok || EMPTY_STRING;  // Use as key for next value seen.
							break;
						}
					}
					cont[key] = tok;
					key = void 0;
					break;
				case 0x5b:  // '['
					cont = stack[0];
					stack.unshift(cont[key || cont.length] = []);
					key = void 0;
					break;
				case 0x5d:  // ']'
					stack.shift();
					break;
				case 0x66:  // 'f'
					cont = stack[0];
					cont[key || cont.length] = false;
					key = void 0;
					break;
				case 0x6e:  // 'n'
					cont = stack[0];
					cont[key || cont.length] = null;
					key = void 0;
					break;
				case 0x74:  // 't'
					cont = stack[0];
					cont[key || cont.length] = true;
					key = void 0;
					break;
				case 0x7b:  // '{'
					cont = stack[0];
					stack.unshift(cont[key || cont.length] = {});
					key = void 0;
					break;
				case 0x7d:  // '}'
					stack.shift();
					break;
			}
		}
		// Fail if we've got an uncompleted object.
		if (topLevelPrimitive) {
			if (stack.length !== 1) { throw new Error(); }
			result = result[0];
		} else {
			if (stack.length) { throw new Error(); }
		}

		if (opt_reviver) {
			// Based on walk as implemented in http://www.json.org/json2.js
			var walk = function (holder, key) {
				var value = holder[key];
				if (value && typeof value === 'object') {
					var toDelete = null;
					for (var k in value) {
						if (hop.call(value, k) && value !== holder) {
							// Recurse to properties first.  This has the effect of causing
							// the reviver to be called on the object graph depth-first.

							// Since 'this' is bound to the holder of the property, the
							// reviver can access sibling properties of k including ones
							// that have not yet been revived.

							// The value returned by the reviver is used in place of the
							// current value of property k.
							// If it returns undefined then the property is deleted.
							var v = walk(value, k);
							if (v !== void 0) {
								value[k] = v;
							} else {
								// Deleting properties inside the loop has vaguely defined
								// semantics in ES3 and ES3.1.
								if (!toDelete) { toDelete = []; }
								toDelete.push(k);
							}
						}
					}
					if (toDelete) {
						for (var i = toDelete.length; --i >= 0;) {
							delete value[toDelete[i]];
						}
					}
				}
				return opt_reviver.call(holder, key, value);
			};
			result = walk({ '': result }, '');
		}

		return result;
	};
})();

(function () {
	// Defaults
	var d = {
		css : true,
		messages : true
	};

	if(typeof(window.hasOwnProperty) == "undefined") {
		//ensure we have this method in IE
		window.hasOwnProperty = function(obj){
			return (this[obj]) ? true : false;
		}
	}

	var parseJSON = function(text){
		if(typeof(JSON)!="undefined") {
			//native JSON parser
			return JSON.parse(text);
		} else {
			//no native parser (ie7)
			return jsonParse(text);
		}
	}

	// Subscription Widget Class
	var c = 'sendgrid-subscription-widget';

	// Shamelessly taken from underscore.js
	// https://github.com/jashkenas/underscore/blob/master/underscore.js
	// License: https://github.com/jashkenas/underscore/blob/master/LICENSE

	var _keys = Object.keys || function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var keys = [];
		for (var key in obj) if (window.hasOwnProperty.call(obj, key)) keys.push(key);
		return keys;
	},

	_identity = function(value) {
		return value;
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

	_lookupIterator = function(value) {
		return (typeof value === "function") ? value : function(obj){ return obj[value]; };
	},

	_sortedIndex = function(array, obj, iterator, context) {
		iterator = iterator == null ? _identity : _lookupIterator(iterator);
		var value = iterator.call(context, obj);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >>> 1;
			iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
		}
		return low;
	},

	_indexOf = function(array, item, isSorted) {
		if (array == null) return -1;
		var i = 0, length = array.length;
		if (isSorted) {
			if (typeof isSorted == 'number') {
				i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
			} else {
				i = _sortedIndex(array, item);
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
	};

	var htmlEvents = {// list of real events
			//<body> and <frameset> Events
			onload:1,
			onunload:1,
			//Form Events
			onblur:1,
			onchange:1,
			onfocus:1,
			onreset:1,
			onselect:1,
			onsubmit:1,
			//Image Events
			onabort:1,
			//Keyboard Events
			onkeydown:1,
			onkeypress:1,
			onkeyup:1,
			//Mouse Events
			onclick:1,
			ondblclick:1,
			onmousedown:1,
			onmousemove:1,
			onmouseout:1,
			onmouseover:1,
			onmouseup:1
	}

	var dispatchCustomEvent = function(el, event) {
		if(el.dispatchEvent){
				el.dispatchEvent(event);
		}else if(el.fireEvent && htmlEvents['on'+event.eventName]){// IE < 9
				el.fireEvent('on'+event.eventType,event);// can trigger only real event (e.g. 'click')
		}else if(el[event.eventName]){
				el[event.eventName]();
		}else if(el['on'+event.eventName]){
				el['on'+event.eventName]();
		}
	}

	//for GOOD browsers that have DOM4 CustomEvents
	if (window.CustomEvent){
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
	} else {
		//for old browsers that suck and don't have DOM4 CustomEvents
		var CustomEvent = function(eventName, params) {
			var evt;
			if(document.createEvent){
					evt = document.createEvent('HTMLEvents');
					evt.initEvent(eventName,true,true);
			}else if(document.createEventObject){// IE < 9
					evt = document.createEventObject();
					evt.eventType = eventName;
			}
			evt.eventName = eventName;
			return evt;
		}
	
		// IE7 has no Element prototype... LOL
		if (!window.Element)
		{
			Element = function(){};

			//make sure the functions we need return elements based on the prototype
			var __createElement = document.createElement;
			document.createElement = function(tagName)
			{
				var element = __createElement(tagName);
				if (element == null) {return null;}
				for(var key in Element.prototype)
								element[key] = Element.prototype[key];
				return element;
			}

			var __getElementById = document.getElementById;
			document.getElementById = function(id)
			{
				var element = __getElementById(id);
				if (element == null) {return null;}
				for(var key in Element.prototype)
								element[key] = Element.prototype[key];
				return element;
			}
		}
	}

	_extend(Element.prototype, {
		//extend elements to have an IE-friendly event listener
		addCustomEventListener: function(type,handler){
			if(this.addEventListener){
					this.addEventListener(type,handler,false);
			}else if(this.attachEvent && htmlEvents['on'+type]){// IE < 9
					this.attachEvent('on'+type,handler);
			}else{
					this['on'+type]=handler;
			}
		}
	});

	// Shamelessly taken from Quirksmode and hacked to bits
	// http://www.quirksmode.org/js/xmlhttp.html
	// License: http://www.quirksmode.org/about/copyright.html
	sendRequest = function (url,callback,postData) {
  		url = "https://" + url; 

		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		
		if (typeof XDomainRequest !== "undefined"){
			//XDR does not support content-type other than text/plain, so no POST
			req.open("GET",url + "?" + postData,true);
			req.onload = function(){ return callback(req) };
			req.send();
		} else {
		if (postData)
			req.open(method,url,true);
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
		 }
	},

	XMLHttpFactories = [
		function () {return new XMLHttpRequest()},
		function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		function () {return new ActiveXObject("Microsoft.XMLHTTP")}
	],

	createXMLHTTPObject = function () {
		//Detect browser support for CORS
		if ('withCredentials' in new XMLHttpRequest()) {
			/* supports cross-domain requests */
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
		else if(typeof XDomainRequest !== "undefined"){
			//Use IE-specific "CORS" code with XDR
			usingXdr = true;
			var xmlhttp = new XDomainRequest(); 
			return xmlhttp;
		}
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

		if(widget.getAttribute("data-executed") === "true"){
			return;
		}
		widget.setAttribute("data-executed", "true");


		if( checkDefault("css", widget, d) && !document.getElementById(c + '-css') ){
			var css = document.createElement('link');
			css.setAttribute('id', c + '-css');
			css.setAttribute('rel', 'stylesheet');
			css.setAttribute('type', 'text/css');
			css.setAttribute('href', "//s3.amazonaws.com/subscription-cdn/0.2/widget.min.css");
			document.getElementsByTagName('head')[0].appendChild(css);
		}

		var widgetInner = widget.innerHTML;
		widget.innerHTML = '';
		var form = document.createElement('form');

		var submitText = widget.getAttribute("data-submit-text") || "Subscribe";
		
		form.innerHTML = '<div class="response"></div>' + widgetInner + '<label><span>Email</span><input type="email" name="email" placeholder="you@example.com"></label><input type="submit" value="' + submitText  + '">';
		widget.appendChild(form);

		var messages = {
			"Your request cannot be processed." : widget.getAttribute("data-message-unprocessed") || "Unfortunately, an error occurred. Please contact us to subscribe.",
			"The email address is invalid." : widget.getAttribute("data-message-invalid") || "The email you provided is not a valid email address. Please fix it and try again.",
			"You have subscribed to this Marketing Email." : widget.getAttribute("data-message-success") || "Thanks for subscribing."
    }

		form.addCustomEventListener("submit", function (e) {
			form = e.srcElement ? e.srcElement : e.target;
			
			var submitData = _extend({}, e),
				submitEvent = CustomEvent("sent", submitData), 
				widget = form.parentNode;

			e.stopPropagation ? e.stopPropagation() : null;
			e.preventDefault ? e.preventDefault() : null;
			
			//IE7 lol
      if (typeof(event) != "undefined") {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
      }

      dispatchCustomEvent(widget, submitEvent);

			var token = decodeURIComponent(widget.getAttribute("data-token")),
				referrer = document.location.href,
				inputs = form.getElementsByTagName("input"),
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

			sendRequest('sendgrid.com/newsletter/addRecipientFromWidget', function (req) {
				var responseData = parseJSON(req.responseText),
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
				}, qs);

				responseType = (responseData.success === false) ? "error" : "success";
				responseEventData.type = responseType;
				responseEvent = CustomEvent(responseType, responseEventData);

				if(checkDefault("messages", widget, d)){
					responseDiv.className = responseDiv.className.replace("error", "").replace("success", "") + " " + responseType;
					responseDiv.innerHTML = messages[responseEventData.message]
						// replace html entities to prevent xss
						.replace(/&/g, '&amp;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#39;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');
				}
				
				dispatchCustomEvent(widget, responseEvent);
			}, qs);
		});

		var readyEvent = CustomEvent("ready", {"info" : "ready"});
		dispatchCustomEvent(widget, readyEvent);
	});
})();


