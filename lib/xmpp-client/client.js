var sys = require('sys'),
	xmpp = require('node-xmpp'),
	colors = require('colors'),
	BasicClient = require('./basic-client').BasicClient;

var Client = function(params, callback) {
	var jabber = this;
	this.roster = {};
	this.presences = {};
	BasicClient.call(this, params, function() {
		this.presence();
		this.getRoster(function(roster) {
			callback.apply(this);
		});
	});
	this.registerIqHandler('http://jabber.org/protocol/disco#info', function(stanza) {
		sys.debug((stanza.attrs.from + " wont to disco!")[jabber.color]);
		jabber.resultIq(stanza, new xmpp.Element('query', {xmlns: 'http://jabber.org/protocol/disco#info'})
		.c('feature', {'var': 'http://jabber.org/protocol/disco#info'}).up()
		.c('feature', {'var': 'http://jabber.org/protocol/disco#items'}).up()
		.c('feature', {'var': 'http://jabber.org/protocol/muc'}).up()
		.c('identity', {
			category: 'conference',
			type: 'text',
			name: 'Play-Specific Chatrooms'
		}).up()
		.tree()
		);
	});
	this.registerIqHandler('jabber:iq:last', function(stanza) {
		sys.debug((stanza.attrs.from + ' wonts last')[jabber.color]);
		//[FIXME] giving a good last time
		jabber.resultIq(stanza, new xmpp.Element('query', {
			xmlns: 'jabber:iq:last', seconds:'1'})
			.tree()
		);
	});
	this.registerIqHandler('jabber:iq:version', function(stanza) {
		jabber.resultIq(stanza, new xmpp.Element('query', {xmlns:'jabber:iq:version'})
			.c('name').t('node-xmpp-client').up()
			.c('version').t('0.0.2').up()
			.c('os').t(process.platform).up()
			.tree()
		);
	});
	
};

sys.inherits(Client, BasicClient);
exports.Client = Client;

Client.prototype.getRoster = function(callback) {
	var jabber = this;
	this.iq(null, new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
		iq.getChild('query', 'jabber:iq:roster').getChildren('item').forEach(function(child) {
			jabber.roster[child.attrs.jid] = {
				name: child.attrs.jid,
				subscription: child.attrs.subscription};
		});
		jabber.emit('roster', jabber.roster);
		callback.call(jabber, jabber.roster);
	});
};

/*
http://xmpp.org/extensions/xep-0092.html
*/
Client.prototype.getVersion = function(jid, callback, error) {
	var jabber = this;
	this.iq(jid, new xmpp.Element('query', {xmlns: 'jabber:iq:version'}), function(iq) {
		var v = iq.getChild('query', 'jabber:iq:version');
		var version = {
			name: v.getChildText('name'),
			version: v.getChildText('version'),
			os: v.getChildText('os')
		};
		callback.call(jabber, version);
	}, error);
};

Client.prototype.disconnect = function() {
	this.xmpp.send(new xmpp.Element('presence', {type: 'unavailable'})
		.c('status').t('Logged out')
		.tree());
	var jabber = this;
/*	Object.keys(this.rooms).forEach(function(room) {
		jabber.rooms[room].leave();
	});*/
	this.xmpp.end();
	sys.debug("disconnect from XMPP");
};
