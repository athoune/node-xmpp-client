var sys = require('sys'),
	colors = require('colors'),
	Client = require('../lib/xmpp-client').Client,
	Jid = require('../lib/xmpp-client').Jid,
	conf = require('./conf').conf;

exports.testJid = function(test) {
	test.expect(4);
	var j = new Jid('mathieu@gtalk.com');
	//sys.debug(JSON.stringify(j));
	test.equals('mathieu', j.node);
	test.equals('gtalk.com', j.domain);
	test.equals('node', j.resource);
	j = new Jid('mathieu@jabber.org/machin');
	//sys.debug(JSON.stringify(j));
	test.equals('machin', j.resource);
	test.done();
};

exports.testClientInit = function(test) {
	var c = new Client('mathieu@gtalk.com', 'toto');
	test.equals('gtalk.com', c.host);
	test.done();
};

exports.testClient = function(test) {
	test.expect(3);
	var MESSAGE = "Beuha de test!";
	var b = new Client(conf.b.jid, conf.b.password);
	b.addListener('message', function(from, msg, stanza){
		sys.debug('Message from ' + from.red + ' : ' + msg.yellow);
		test.equals(MESSAGE, msg);
		test.done();
	});
	b.addListener('online', function() {
		sys.debug('b is connected'.red);
		test.ok(true);
		var a = new Client(conf.a.jid, conf.a.password);
		a.addListener('online', function() {
			sys.debug('a is connected'.green);
			test.ok(true);
			a.message(conf.b.jid, MESSAGE);
		});
	});
};

if(module.id == '.') {
	var testrunner = require('nodeunit').testrunner;
	testrunner.run([__filename]);
}