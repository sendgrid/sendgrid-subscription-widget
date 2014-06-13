jQuery(function ($) {
	$(".show-code").each(function () {
		var $code = $("<pre><code></code></pre>").insertAfter(this);
		var rawCode = $(this).html();
		rawCode = rawCode.trim();
		$code.children().text(rawCode);
	});

	try {
		hljs.initHighlightingOnLoad();
	} catch (e) {
		console.log(e);
	}
});