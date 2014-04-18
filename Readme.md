# SendGrid Subscription Widget
A new SendGrid subscription widget that works with existing infrastructure.

## Basic Use

Include the following code on the page where you wish the widget to appear.

```html
<div class="sendgrid-subscription-widget" data-token="1M5Z249eGJzJ34D5llN3s2KkzNImaU9gZp8ImuJSw1pmhsJvugAYeWJXhtK1aWLO"></div>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://s3.amazonaws.com/subscription-cdn/0.2/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>
```

`token` is the `p` parameter from the current SendGrid Subscription Widget URL

_Samples can be found on [Github Pages](http://sendgrid.github.io/sendgrid-subscription-widget/examples/basic.html)._

**Note**: With current architecture this widget will only work on the domain specified when generating the token.

## Settings
Settings can be controlled through a number of data attributes.

| attribute                  | value                 | default                                                                             | required | description                                                                                                                                          |
|----------------------------|-----------------------|-------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `data-token`               | `string`              | `null`                                                                              | yes      | a parameter identifying your subscription widget (previously the `p` parameter found in the SendGrid Subscription Widget URL)                        |
| `data-css`                 | `true` &#124; `false` | `true`                                                                              | no       | whether or not to load the basic css provided by the plugin                                                                                          |
| `data-messages`            | `true` &#124; `false` | `true`                                                                              | no       | whether or not to automatically display messages of success/failure                                                                                  |
| `data-message-unprocessed` | `string`              | "Unfortunately, an error occurred. Please contact us to subscribe."                 | no       | the message shown when the form could not be processed for whatever reason                                                                            |
| `data-message-invalid`     | `string`              | "The email you provided is not a valid email address. Please fix it and try again." | no       | the message shown when an invalid email address is given. _(modern browsers will not allow the form to submit and display a **different** message)_  |
| `data-message-success`     | `string`              | "Thanks for subscribing."                                                           | no       | the message shown when a subscription is successful                                                                                                  |
| `data-submit-text`         | `string`              | "Subscribe"                                                                         | no       | the text value of the submit button

## CSS
The resulting form is fully styleable. The resulting form follows the DOM tree of:

```html
<div class="sendgrid-subscription-widget" data-token="1M5Z249eGJzJ34D5llN3s2KkzNImaU9gZp8ImuJSw1pmhsJvugAYeWJXhtK1aWLO" data-executed="true">
    <form>
        <div class="response"></div>
        <label>
        	<span>Email</span>
        	<input type="email" name="email" placeholder="you@example.com" />
        </label>
        <input type="submit" value="submit" />
    </form>
</div>
```
	    
With this you may style using descendant selectors. If you wish to use both the default widget styles _and_ your own, it is recommended you use `div.sendgrid-subscription-widget` as your base selector. This specificity overrides the default styles so you may do what you wish, without conflict.

## Additional Form Fields
You may specify whatever you want to include in the form by enclosing it in the `<div class="sendgrid-subscription-widget">` tag. _However, unless these fields coordinate with mappings you've previously setup, with SendGrid, they will not be stored._

### Example

```html
<div class="sendgrid-subscription-widget" data-token="1M5Z249eGJzJ34D5llN3s2KkzNImaU9gZp8ImuJSw1pmhsJvugAYeWJXhtK1aWLO">
    <input type="text" name="happy" value="go lucky" />
</div>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://s3.amazonaws.com/subscription-cdn/0.2/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'sendgrid-subscription-widget-js');</script>
```

If you have additional fields stored by SendGrid that you wish to store with the subscription widget, you must place them in this tag. To determine your fields mappings to our database use [the widget generator, found on the lists page in the SendGrid UI](https://sendgrid.com/newsletter/lists).

## Javascript API
It is possible to add more advanced functionality through the JS API provided by the widget. This is provided in the form of DOM Events that a script may then react to.

Events are broadcast to the DOM node `div.sendgrid-subscription-widget`, where they may be subscribed to and acted upon.

|   event   |                 description                  |
|-----------|----------------------------------------------|
| `ready`   | the form has been loaded                     |
| `sent`    | the form created by the widget been submitted |
| `error`   | there was an error with the form submission  |
| `success` | the email was subscribed                     |

### Examples

### Complex HTML Error Messages
This code sample adds complex error messages that are not be possible to include in the data attributes provided by the plugin. _You'll want to toggle `data-messages` to `false`._

_This example is written assuming you're using jQuery (it of course can be written without the library)._

```js
$(".sendgrid-subscription-widget").on("success", function (e) {
    $(this).find(".response").addClass("success").html("<img src=\"colon/d/face.png\" alt=\"YAY!\"> " + e.detail);
});

$(".sendgrid-subscription-widget").on("error", function (e) {
    $(this).find(".response").addClass("error").html("<img src=\"sad/panda/face.png\" alt=\"D:\"> " + e.detail);
});
```

#### Add A Loader To The Widget
This code sample will add a loader and disable the submission button (to prevent accidental double submissions). 

_This example is written assuming you're using jQuery (it of course can be written without the library)._

```js
$(".sendgrid-subscription-widget").on("sent", function () {
    $(this).addClass("loading")
           .append("<img src=\"my/super/cool/loading.gif\" alt=\"Loading...\">");
    $(this).find("input[type=submit").attr("disabled", "disabled");

    $(".sendgrid-subscription-widget").on("success error", function () {
        $(this).removeClass("loading")
        $(this).find("img").remove();
        $(this).find("input[type=submit").removeAttr("disabled");
    });
});
```

_**Note**: It's better to [namespace your events](http://api.jquery.com/on/#event-names) and then turn them off to prevent a possible race condition, [(as seen in this gist)](https://gist.github.com/nquinlan/5f73a310830d56d0c532)._

#### Track A Subscription With Google Analytics
This code will send an event to Google Analytics any time someone subscribes to your emails, allowing you to create goals and metrics and better understand your users.

_This example is written assuming you're using jQuery (it of course can be written without the library)._

```js
$(".sendgrid-subscription-widget").on("success", function () {
    _gaq.push(['_trackEvent', 'Form', 'Subscribe', 'Newsletter']);
});
```

---

## Development
[Thanks for considering developing this plugin further](http://who-is-awesome.com/)! If you make major changes please also write tests for them. This plugin uses Grunt to do all the heavy lifting of minifying and naming things. 

By default `grunt` will compile to the `build/` directory, this will allow you to develop easily. To compile for testing use `grunt --test`, for distribution use `grunt --dist`.

Please give [me](https://github.com/nquinlan/) a shout if you have any questions.

### Environment Setup
To develop this widget, you'll need `node.js`. Run `npm install` in the root directory of this plugin to get setup. Additionally, you'll need duplicate and rename `config.sample.json` to `config.json`
