$(function () {
	var widgetDefaultDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\"><input type=\"text\" name=\"name\"><input type=\"text\" name=\"number\"></div>";
	var widgetDefaultScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='../build/widget.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
	var widgetDefault = widgetDefaultDiv + widgetDefaultScript;
	var successMessage = '{"message":"You have subscribed to this Marketing Email.","success":true}';

	var queryStringToObj = function (query) {
		var data = query.split("&");
		var result = {};
		for(var i=0; i<data.length; i++) {
		var item = data[i].split("=");
			result[item[0]] = item[1];
		}
		return result;
	}

	module("fields");

	asyncTest("should place additional text fields in form", function () {

		$(widgetDefaultDiv).on("ready", function () {
			equal($(this).find("input").length, 4, "additional fields included in form");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

	// test("nick!", function () {
	// 	deepEqual({"a" : "aa", "b" : "bb"}, {"b" : "bb", "a" : "aa"});
	// });

	asyncTest("additional fields should be serialized and sent", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, successMessage]);

		var values = {"email" : "nick@sendgrid.com", "name" : "Nick Quinlan", "number" : "42"};

		$(widgetDefaultDiv).on("ready", function () {
			$("#qunit-fixture form").on("submit", function () {
				var requestBody = server.requests[0].requestBody;
				
				console.log(requestBody);

				$.each(values, function (key, value) {
					console.log(key, value);
					var expected = "SG_widget[" + key + "]=" + encodeURIComponent(value);
					var match = requestBody.indexOf(expected);
					var okay = (match != -1);
					ok(okay, key + " matches expected value");
				});

				start();
				server.respond();
			});

			$.each(values, function (key, value) {
				$("#qunit-fixture").find("input[name=" + key + "]").val(value);
			});

			$("#qunit-fixture form input[type=submit]").click();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

});