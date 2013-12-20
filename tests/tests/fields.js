$(function () {
	var widgetDefaultDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\"><input type=\"text\" name=\"name\"><input type=\"text\" name=\"number\"></div>";
	var widgetDefaultScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='widget/widget.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
	var widgetDefault = widgetDefaultDiv + widgetDefaultScript;

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

	asyncTest("additional fields should be serialized and sent", function () {
		

		var values = {"email" : "nick@sendgrid.com", "name" : "Nick Quinlan", "number" : "42"};

		$(widgetDefaultDiv).on("ready", function () {
			$("#qunit-fixture form").on("submit", function () {

				$.post("https://sg-subscription-tests.herokuapp.com/subscribe/response", { type : 'good' }, function () {

					$.get("https://sg-subscription-tests.herokuapp.com/subscribe/request", {}, function (data) {

						$.each(values, function (key, value) {
							ok(data.SG_widget[key], key + " matches expected value");
						});
						start();
					});
					
				});
				
			});

			$.each(values, function (key, value) {
				$("#qunit-fixture").find("input[name=" + key + "]").val(value);
			});

			$("#qunit-fixture form input[type=submit]").click();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

});