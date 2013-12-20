$(function () {
	module("loading",
		{
		  teardown: function() {
		    $("#sendgrid-subscription-widget-js").remove();
		    $("#sendgrid-subscription-widget-css").remove();
		  }
		}
	);

	var widgetDefault = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\"></div><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='widget/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
		
	test("should asyncronously load javascript", function () {
		$(widgetDefault).appendTo("#qunit-fixture");
		equal($("#sendgrid-subscription-widget-js").length, 1, "javascript loaded");
	});

	asyncTest("should asyncronously load css", function () {
		$(widgetDefault).appendTo("#qunit-fixture");
		$("#sendgrid-subscription-widget-js").on("load", function () {
			equal($("#sendgrid-subscription-widget-css").length, 1, "css loaded");
			start();
		});
	});

	asyncTest("should asyncronously load css only once", function () {
		$(widgetDefault).appendTo("#qunit-fixture");
		$(widgetDefault).appendTo("#qunit-fixture");
		$("#sendgrid-subscription-widget-js").on("load", function () {
			equal($("#sendgrid-subscription-widget-css").length, 1, "css loaded only once");
			start();
		});
	});

	asyncTest("should asyncronously load css, when explicitly stated", function () {
		var widgetExplicitCSS = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"true\"></div><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='widget/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
		$(widgetExplicitCSS).appendTo("#qunit-fixture");
		$("#sendgrid-subscription-widget-js").on("load", function () {
			equal($("#sendgrid-subscription-widget-css").length, 1, "css loaded");
			start();
		});
	});

	asyncTest("should not load css, when explicitly stated", function () {
		var widgetExplicitCSS = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\"></div><script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='widget/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
		$(widgetExplicitCSS).appendTo("#qunit-fixture");
		$("#sendgrid-subscription-widget-js").on("load", function () {
			equal($("#sendgrid-subscription-widget-css").length, 0, "css not loaded");
			start();
		});
	});
});