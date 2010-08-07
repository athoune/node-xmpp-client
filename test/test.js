var sys = require('sys'),
	colors = require('colors'),
	Client = require('../lib/xmpp-client').Client,
	JID = require('xmpp').JID,
	conf = require('./conf').conf;

exports.testJid = function(test) {
	test.expect(4);
	var j = new JID('mathieu@gtalk.com');
	//sys.debug(JSON.stringify(j));
	test.equals('mathieu', j.user);
	test.equals('gtalk.com', j.domain);
	test.equals(null, j.resource);
	j = new JID('mathieu@jabber.org/machin');
	//sys.debug(JSON.stringify(j));
	test.equals('machin', j.resource);
	test.done();
};

exports.testClientInit = function(test) {
	var c = new Client({jid: 'mathieu@gtalk.com', password:'toto'});
	test.equals('gtalk.com', c.host);
	test.done();
};
/*
exports.testClient = function(test) {
	test.expect(3);
	var MESSAGE = "Beuha de test!";
	var b = new Client(conf.b);
	b.addListener('message', function(from, msg, stanza){
		sys.debug('Message from ' + from.red + ' : ' + msg.yellow);
		test.equals(MESSAGE, msg);
		test.done();
	});
	b.addListener('online', function() {
		sys.debug('b is connected'.red);
		test.ok(true);
		var a = new Client(conf.a);
		a.addListener('online', function() {
			sys.debug('a is connected'.green);
			sys.debug('a presences : ' + JSON.stringify(a.presences).green);
//			test.equals('available', a.presences['' + b.jid]);
			test.ok(true);
			a.message(conf.b.jid, MESSAGE);
		});
	});
};
*/

exports.testRoom = function(test) {
	var ROOM = 'mushroom@conference.' + conf.b.jid.split('@')[1];
	var b = new Client(conf.b, function() {
		sys.debug('b is connected'.red);
		sys.debug(('enter in ' + ROOM).green);
		var b_room = b.room(ROOM, function(status) {
			var a = new Client(conf.a, function() {
				sys.debug('a is connected'.green);
				var a_room = a.room(ROOM, function(status) {
					sys.debug(status);
					test.done();
				});
			});
			
		});
	});
};

if(module.id == '.') {
	var testrunner = require('nodeunit').testrunner;
	testrunner.run([__filename]);
}