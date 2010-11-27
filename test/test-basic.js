var sys = require('sys'),
	colors = require('colors'),
	xmpp = require('node-xmpp'),
	BasicClient = require('../lib/xmpp-client').BasicClient,
	JID = require('node-xmpp').JID,
	conf = require('./conf').conf;

exports.testInit = function(test) {
	test.expect(1);
	var b = new BasicClient(conf.b, function() {
		sys.debug('just connected');
		test.ok('true', 'connected');
		test.done();
	});
};