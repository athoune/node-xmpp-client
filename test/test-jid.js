var sys = require('sys'),
	colors = require('colors'),
	JID = require('node-xmpp').JID,
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
