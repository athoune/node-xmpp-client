var sys = require('sys'),
	xmpp = require('node-xmpp'),
	colors = require('colors'),
	events = require('events');

function Pubsub(client, to) {
	this.client = client;
	if(to == null) {
		to = 'pubsub.' + this.client.jid.domain;
	}
	this.to = to;
};

sys.inherits(Pubsub, events.EventEmitter);

exports.Pubsub = Pubsub;

Pubsub.prototype.createTree = function() {
	sys.debug(new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('create', {node: '/home/' + this.client.jid.domain + '/user'}).up()
		.c('configure')
		.tree());
	this.client.iqSet(this.to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('create', {node: '/home/' + this.client.jid.domain + '/user'}).up()
		.c('configure')
		.tree(),
		function(stanza) {
			sys.debug(stanza.toString().yellow);
			sys.debug(stanza.getChild('pubsub', 'http://jabber.org/protocol/pubsub').toString.yellow);
		}
	);
};

Pubsub.prototype.disco = function(callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('query', {xmlns: 'http://jabber.org/protocol/disco#info'}),
		function(iq) {
			callback.call(jabber, iq.getChild('query', 'http://jabber.org/protocol/disco#info'));
		}
	);
};

Pubsub.prototype.discoNode = function(node, callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('query', {xmlns: 'http://jabber.org/protocol/disco#info', node: node}),
		function(iq) {
			callback.call(jabber, iq.getChild('query', 'http://jabber.org/protocol/disco#info'));
		}
	);
};

Pubsub.prototype.subscriptions = function(callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'}).c('subscriptions'),
		function(iq) {
			callback.call(jabber, iq
				.getChild('pubsub', 'http://jabber.org/protocol/pubsub')
				.getChild('subscriptions')
				.getChildren('subscription')
			);
		}
	);
};

Pubsub.prototype.nodeSubscriptions = function(node, callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'}).c('subscriptions', {node: node}),
		function(iq) {
			callback.call(jabber, iq
				.getChild('pubsub', 'http://jabber.org/protocol/pubsub')
				.getChild('subscriptions')
				.getChildren('subscription')
			);
		}
	);
};


Pubsub.prototype.discoNodeItems = function(node, callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('query', {xmlns: 'http://jabber.org/protocol/disco#items', node: node}),
		function(iq) {
			callback.call(jabber, iq.getChild('query', 'http://jabber.org/protocol/disco#items').getChildren('item'));
		}
	);
};


Pubsub.prototype.discoNodes = function(callback) {
	var jabber = this.client;
	this.client.iq(this.to,
		new xmpp.Element('query', {xmlns: 'http://jabber.org/protocol/disco#items'}),
		function(iq) {
			callback.call(jabber, iq.getChild('query', 'http://jabber.org/protocol/disco#items').getChildren('item'));
		}
	);
};

Pubsub.prototype.node = function(node, callback) {
	var exist = false;
	var pubsub = this;
	this.discoNodes(function(items) {
		items.forEach(function(item) {
			if(item.attrs.node == node) { exist = true; }
		});
		if(! exist) { pubsub.createNode(node, callback); }
		else { callback.call(pubsub.client); }
	});
};

Pubsub.prototype.createNode = function(node, callback) {
	var jabber = this.client;
	this.client.iqSet(this.to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('create', {node: node}).up()
		.c('configure')
		.tree(),
		function(stanza) {
			var pubsub = stanza.getChild('pubsub', 'http://jabber.org/protocol/pubsub');
			if(pubsub != null) {
				sys.debug(pubsub.toString().yellow);
				callback.call(jabber);
			}
		}
	);
};

Pubsub.prototype.publish = function(node, content) {
	this.client.iqSet(this.to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('publish', {node: node})
			.c('item')
				.cnode(content)
	.tree(),
	function(iq) {
		sys.debug('PUBLISH : ' + iq);
		sys.debug('just published'.yellow);
	}
	);
};

Pubsub.prototype.suscribe = function(node, onMessage, onSuscribed) {
	var jabber = this.client;
	var pubsub = this;
	jabber.iqSet(this.to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('subscribe', {
			node: node,
			jid: jabber.jid.user + '@' + jabber.jid.domain
		})
		.tree(),
		function(iq) {
			sys.debug(('Suscribe to ' + node).yellow);
			jabber._pubSubCallback[pubsub.to + '#' + node] = onMessage;
			var s = iq.getChild('pubsub', 'http://jabber.org/protocol/pubsub').attrs;
			onSuscribed.call(jabber, s.subscription, s.subid);
		}
	);
};
