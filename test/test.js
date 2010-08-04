var sys = require('sys'),
	client = require('../lib/xmpp-client').Client,
	jid = require('../lib/xmpp-client').jid;

exports.testJid = function(test) {
	var j = jid('mathieu@gtalk.com');
	//sys.debug(JSON.stringify(j));
	test.equals('mathieu', j.node);
	test.equals('gtalk.com', j.domain);
	test.equals(null, j.resource);
	j = jid('mathieu@jabber.org/node');
	//sys.debug(JSON.stringify(j));
	test.equals('node', j.resource);
	test.done();
};

if(module.id == '.'){
    var testrunner = require('nodeunit').testrunner;
    testrunner.run([__filename]);
}