var sys = require('sys'),
	colors = require('colors'),
	xmpp = require('node-xmpp'),
	BasicClient = require('../lib/xmpp-client').BasicClient,
	JID = require('node-xmpp').JID,
	conf = require('./conf').conf;

exports.testInit = function(test) {
	test.expect(1);
	var b = new BasicClient(conf.b, function() {
		test.ok(true, 'connected');
		test.done();
	});
};

exports.testIq = function(test) {
	test.expect(1);
	new BasicClient(conf.b, function() {
		this.iq(null, new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
			var roster = iq.getChild('query', 'jabber:iq:roster').getChildren('item');
			//sys.debug(roster);
			test.notEqual(null, roster, 'roster');
			test.done();
		});
	});
};

exports.testPresence = function(test) {
	/*
	[FIXME] this test don't manage Resource, if you have an opened jabber client, it may hurt this test
	*/
	test.expect(1);
	var prems = true;
	var b = new BasicClient(conf.b, function() {
		this.addListener('presence', function(presence) {
			//sys.debug(presence.attrs.from.red);
			if(presence.attrs.from.split('/')[0] == conf.a.jid && prems) {
				test.ok(true, "B is present");
				test.done();
				prems = false;
			}
		});
		var a = new BasicClient(conf.a, function() {
			this.addListener('presence', function(presence) {
				//sys.debug(presence.toString().yellow);
			});
			this.presence();
			b.presence();
		});
	});
};