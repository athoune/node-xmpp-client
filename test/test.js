var sys = require('sys'),
	colors = require('colors'),
	xmpp = require('node-xmpp'),
	Client = require('../lib/xmpp-client').Client,
	conf = require('./conf').conf;

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

/*
exports.testRoom = function(test) {
	test.expect(1);
	var ROOM = 'mushroom@conference.' + conf.b.jid.split('@')[1];
	var MESSAGE = "Hello everybody";
	var cpt = 0;
	var b = new Client(conf.b, function() {
		sys.debug('b is connected'.red);
		sys.debug(('enter in ' + ROOM).green);
		//console.log(sys.inspect(this, true, null));
		var b_room = b.room(ROOM, function(status) {
			sys.debug('b room is created'.green);
			this.addListener('message', function(from, msg, stanza) {
				sys.debug(from.yellow);
				test.equals(MESSAGE, msg);
				if(MESSAGE == msg) {
					test.done();
				}
			});
			var a = new Client(conf.a, function() {
				sys.debug('a is connected'.green);
				var a_room = a.room(ROOM, function(status) {
					sys.debug(status.green);
					sys.debug(this.role.green);
					this.addListener('message', function(from, msg, stanza) {
						sys.debug('message : ' + msg);
					});
					this.message(MESSAGE);
				});
			});
		});
	});
};
*/
exports.testPubSub = function(test) {
	var POEMS = 'poems';
	var b = new Client(conf.b, function() {
		sys.debug('b is connected'.red);
		this.addListener('iq:error', function(id, stanza) {
			sys.error(stanza.toString().red);
			test.done();
		});
		this.pubsub().node(POEMS, function() {
			sys.debug('got my node'.yellow);
			sys.debug('node : ' + this.toString().red);
			this.suscribe(
				function(item) {
					sys.debug('MESSAGE PUBSUB : ' + item.toString().yellow);
					test.done();
				},
				function(subsription, id) {
					this.publish(new xmpp.Element('entry', {xmlns: 'http://www.w3.org/2005/Atom'})
						.c('title').t('blab blah')
						.tree());
				}
			);
		});
	});
};

/*if(module.id == '.') {
	var testrunner = require('nodeunit').reporters.default;
	testrunner.run([__filename]);
}*/
