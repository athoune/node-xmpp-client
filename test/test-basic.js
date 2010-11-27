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
		test.ok(true, 'connected');
		test.done();
	});
};

exports.testIq = function(test) {
	test.expect(1);
	new BasicClient(conf.b, function() {
		this.iq(null, new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
			var roster = iq.getChild('query', 'jabber:iq:roster').getChildren('item');
			sys.debug(roster);
			test.notEqual(null, roster, 'roster');
			test.done();
		});
	});
};