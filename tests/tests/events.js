$(function () {
	var widgetDefaultDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\"></div>";
	var widgetCustomMessageDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\" data-message-unprocessed=\"unprocessed\" data-message-invalid=\"invalid\" data-message-success=\"success\"></div>";
	var widgetNoMessageDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\" data-messages=\"false\"></div>";
	var widgetDefaultScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='../build/widget.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
	var widgetDefault = widgetDefaultDiv + widgetDefaultScript;
	var responses = {
		'good' : '{"message":"You have subscribed to this Marketing Email.","success":true}',
		'invalid' : '{"success":false,"message":"The email address is invalid."}',
		'unprocessed' : '{"success":false,"message":"Your request cannot be processed."}'
	};

	var prepareAndFillForm = function (server) {
		$("#qunit-fixture form").on("submit", function () {
			server.respond();
		});

		$("#qunit-fixture").find("input[name=email]").val("nick@sendgrid.com");
		$("#qunit-fixture form input[type=submit]").click();
	};

	module("events");

	asyncTest("should broadcast ready event", function () {
		$(widgetDefaultDiv).on("ready", function () {
			ok(true, "ready event dispatched");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});

	asyncTest("should broadcast sent event", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.good]);

		$(widgetDefaultDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("sent", function () {
			ok(true, "sent event dispatched");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

	asyncTest("should broadcast success event", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.good]);

		$(widgetDefaultDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("success", function () {
			ok(true, "success event dispatched");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

	asyncTest("should broadcast error event", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.invalid]);

		$(widgetDefaultDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("error", function () {
			ok(true, "error event dispatched on invalid email");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

	asyncTest("should broadcast error event", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.unprocessed]);

		$(widgetDefaultDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("error", function () {
			ok(true, "error event dispatched on unprocessed");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");

	});

	module("messages");

	asyncTest("should display no messages text", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.good]);

		$(widgetNoMessageDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("success", function () {
			equal($("#qunit-fixture .response").text(), "", "no messages displayed");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});

	asyncTest("should display custom subscribed text", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.good]);

		$(widgetCustomMessageDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("success", function () {
			equal($("#qunit-fixture .response").text(), "success", "custom subscribed text displayed");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});

	asyncTest("should display custom invalid text", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.invalid]);

		$(widgetCustomMessageDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("error", function () {
			equal($("#qunit-fixture .response").text(), "invalid", "custom invalid text displayed");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});


	asyncTest("should display custom unprocessed text", function () {
		var server = sinon.fakeServer.create();
		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
							[200, { "Content-Type": "application/json" }, responses.unprocessed]);

		$(widgetCustomMessageDiv).on("ready", function () {
			prepareAndFillForm(server);
		}).on("error", function () {
			equal($("#qunit-fixture .response").text(), "unprocessed", "custom unprocessed text displayed");
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});

});
