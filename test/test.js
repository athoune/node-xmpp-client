var sys = require('sys'),
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
	test.expect(1);
	var c = new Client(conf.jid, conf.password);
	c.debug = true;
	c.addListener('online', function() {
		test.ok(true);
		test.done();
	});
};

if(module.id == '.') {
	var testrunner = require('nodeunit').testrunner;
	testrunner.run([__filename]);
}