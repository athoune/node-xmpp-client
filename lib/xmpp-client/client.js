var sys = require('sys'),
	xmpp = require('xmpp'),
	colors = require('colors'),
	events = require('events');

var Client = function(params) {
	events.EventEmitter.call(this);
	this.color = (params.color != null) ? params.color : 'blue';
	this.debug = true;
	var jabber = this;
	this.jid = new xmpp.JID(params.jid);
	this.host = (params.host == null) ? this.jid.domain : params.host;
	this.rooms = {};
	this._iq = 0;
	this._iqCallback = {};
	this.presences = {};
	this.roster = {};
	this.xmpp = new xmpp.Client(params);
	this.xmpp.addListener('rawStanza', function(stanza) {
		sys.debug("RAW: "[jabber.color] + stanza.toString().white);
	});
	this.xmpp.addListener('authFail', function() {
		sys.error("[Error] Jabber : Authentication failure");
		process.exit(1);
	});
	this.xmpp.addListener('error', function(e) {
		sys.error(e);
		process.exit(1);
	});
	this.xmpp.addListener('stanza', function(stanza) {
		sys.debug('STANZA: '[jabber.color] + stanza);
		if(stanza.name == 'iq') {
			if(stanza.attrs.type == 'result') {
				jabber._debug('IQ result: ' + stanza);
				jabber.emit('iqResult', stanza.attrs.id, stanza);
			} else {
				jabber._debug('IQ: ' + stanza);
				jabber.emit('iq', stanza);
			}
		}
		if(stanza.name == 'presence') {
			var fromm = new xmpp.JID(stanza.attrs.from);
			if(fromm.domain == 'conference.' + this.jid.domain) {
				jabber.rooms[fromm.user].emit('presence', stanza);
			} else {
				jabber.emit('presence', stanza.attrs.from, stanza);
			}
		}
		if(stanza.name == 'message') {
			var from = stanza.attrs.from;
			if(stanza.attrs.type == 'groupchat') {
				jabber.emit('groupchat', from, stanza);
			} else {
				jabber._debug('MESSAGE: ' + stanza);
				jabber.emit('message', from, stanza.getChild('body').getText(), stanza);
			}
		}
	});
	this.xmpp.addListener('online', function() {
		jabber._debug("[Info] xmpp connection");
		jabber.presence();
		jabber.askForRoster();
		jabber.emit('online');
	});
	this.addListener('groupchat', function(from, stanza) {
		fromName = from.split('@')[0];
		jabber.rooms[fromName].emit('message', stanza);
	});
	this.addListener('iqResult', function(id, stanza){
		jabber._iqCallback[id].call(jabber, stanza);
	});
	this.addListener('presence', function(from, stanza) {
		jabber.presences[from] = stanza.attrs.type;
	});
};

sys.inherits(Client, events.EventEmitter);
exports.Client = Client;

Client.prototype._debug = function(txt) {
	if(this.debug) {
		sys.debug(txt);
	}
};

Client.prototype.message = function(to, message) {
	this.xmpp.send(new xmpp.Element('message', {
		to: to,
		type: 'chat'}).
		c('body').
		t(message));
};

Client.prototype.askForRoster = function() {
	var jabber = this;
	this.iq(new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
		iq.getChild('query', 'jabber:iq:roster').children.forEach(function(child) {
			jabber.roster[child.attrs.jid] = {
				name: child.attrs.name,
				subscription: child.attrs.subscription};
		});
		jabber._debug("ROSTER : " + JSON.stringify(jabber.roster));
		jabber.emit('roster', iq);
	});
};

Client.prototype.iq = function(iq, callback) {
	var n = this._iq++;
	this._iqCallback[n] = callback;
	this.xmpp.send(new xmpp.Element('iq', {type:"get", id: n}).cnode(iq).tree());
};

Client.prototype.presence = function(type) {
	this.xmpp.send(new xmpp.Element('presence', (type != null) ? {type: type} : {}).tree());
};

Client.prototype.disconnect = function() {
	this.xmpp.send(new xmpp.Element('presence', {type: 'unavailable'})
		.c('status')
		.t('Logged out')
		.tree());
	var jabber = this;
/*	Object.keys(this.rooms).forEach(function(room) {
		jabber.rooms[room].leave();
	});*/
	this.xmpp.end();
	sys.debug("disconnect from XMPP");
};
