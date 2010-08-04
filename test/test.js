var sys = require('sys'),
	Client = require('../lib/xmpp-client').Client,
	Jid = require('../lib/xmpp-client').Jid;

exports.testJid = function(test) {
	var j = new Jid('mathieu@gtalk.com');
	//sys.debug(JSON.stringify(j));
	test.equals('mathieu', j.node);
	test.equals('gtalk.com', j.domain);
	test.equals(null, j.resource);
	j = new Jid('mathieu@jabber.org/node');
	//sys.debug(JSON.stringify(j));
	test.equals('node', j.resource);
	test.done();
};

exports.testClient = function(test) {
	var c = new Client('mathieu@gtalk.com', 'toto');
	test.equals('gtalk.com', c.host);
	test.done();
};

if(module.id == '.'){
    var testrunner = require('nodeunit').testrunner;
    testrunner.run([__filename]);
}