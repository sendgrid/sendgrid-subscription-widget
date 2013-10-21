# SendGrid Subscription Widget
A new SendGrid subscription widget that works with existing infrastructure.

_Documentation to come shortly._

## Basic Use

Include the following code on the page where you wish the widget to appear.

	<div class="sendgrid-subscription-widget" data-token="1M5Z249eGJzJ34D5llN3s2KkzNImaU9gZp8ImuJSw1pmhsJvugAYeWJXhtK1aWLO"></div>
	<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://raw.github.com/nquinlan/sendgrid-subscription-widget/master/dist/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>

`token` is the `p` parameter from the current SendGrid Subscription Widget URL

_Samples can be found on [Github Pages](http://nquinlan.github.io/sendgrid-subscription-widget/samples/index.html)._
