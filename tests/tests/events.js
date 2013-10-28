$(function () {
	module("events");
	var widgetDefaultDiv = "<div class=\"sendgrid-subscription-widget\" data-token=\"NOTAREALTOKEN\" data-css=\"false\"></div>";
	var widgetDefaultScript = "<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='../build/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>";
	var widgetDefault = widgetDefaultDiv + widgetDefaultScript;
	var responses = {
		'good' : '{"message" : "You have subscribed to this Marketing Email.","success" : true}',
		'invalid' : '{"success" : false, "message" : "The email address is invalid."}',
		'processed' : '{"success" : false, "message" : "Your request cannot be processed."}'
	};

	asyncTest("should broadcast ready event", function () {
		$(widgetDefaultDiv).on("ready", function () {
			ok(true);
			start();
		}).appendTo("#qunit-fixture");
		$(widgetDefaultScript).appendTo("#qunit-fixture");
	});

	test("should respond true with ", function () {
		var server = this.sandbox.useFakeServer();

		server.respondWith("POST", "https://sendgrid.com/newsletter/addRecipientFromWidget",
		                   [200, { "Content-Type": "application/json" },
		                    responses.good]);

		var callback = this.spy();
		myLib.getCommentsFor("/some/article", callback);
		server.respond();

		ok(callback.calledWith([{ id: 12, comment: "Hey there" }]));
	});
});