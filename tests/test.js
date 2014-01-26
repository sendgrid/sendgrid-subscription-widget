var express = require('express');
var app = express();
var webdriver = require('wd');

// Serve Tests
app.use(express.static(__dirname + '/tests'));
app.listen(4445);


var browser = webdriver.remote(
	"ondemand.saucelabs.com",
	80,
	process.env.SAUCE_USERNAME,
	process.env.SAUCE_PASSWORD
);

var desired = {
  browserName: 'iphone',
  version: '7',
  platform: 'OS X 10.9',
  device-orientation: 'portrait',
  tunnel-identifier: process.env.TRAVIS_JOB_NUMBER,
  build: process.env.TRAVIS_JOB_NUMBER,
}

browser.init(desired, function() {
	browser.get("http://saucelabs.com/test/guinea-pig", function() {
	}
});