var sys = require('sys'),
	colors = require('colors'),
	xmpp = require('node-xmpp'),
	Client = require('../lib/xmpp-client').Client,
	conf = require('./conf').conf;

exports.testClient = function(test) {
	test.expect(3);
	var MESSAGE = "Beuha de test!";
	var b = new Client(conf.b, function() {
		this.addListener('message', function(stanza){
			sys.debug('Message from ' + stanza.toString().red);
			test.equals(MESSAGE, stanza.getChild('body').getText());
			test.done();
		});
		sys.debug('b is connected'.red);
		test.ok(true);
		var a = new Client(conf.a, function(){
			sys.debug('a is connected'.green);
			sys.debug('a presences : ' + JSON.stringify(a.presences).green);
//		test.equals('available', a.presences['' + b.jid]);
			test.ok(true);
			a.message(conf.b.jid, MESSAGE);
		});
	});
};
