var sys = require('sys'),
	xmpp = require('node-xmpp'),
	colors = require('colors'),
	events = require('events'),
	Room = require('./room').Room;

var BasicClient = function(params) {
	events.EventEmitter.call(this);
	this._iq = 0;
	var jabber = this;
	this.jid = new xmpp.JID(params.jid);
	this.host = (params.host == null) ? this.jid.domain : params.host;
	this.xmpp = new xmpp.Client(params);
	this.xmpp.addListener('rawStanza', function(stanza) {
		//sys.debug("RAW: "[jabber.color] + stanza.toString().white);
	});
	this.xmpp.addListener('authFail', function() {
		sys.error("[Error] Jabber : Authentication failure");
		process.exit(1);
	});
	this.xmpp.addListener('error', function(e) {
		sys.error(e);
		process.exit(1);
	});
};

sys.inherits(BasicClient, events.EventEmitter);
exports.BasicClient = BasicClient;

BasicClient.prototype.message = function(to, message) {
	this.xmpp.send(new xmpp.Element('message', {
		to: to,
		type: 'chat'})
		.c('body').t(message));
};

BasicClient.prototype.presence = function(type) {
	this.xmpp.send(new xmpp.Element('presence', (type != null) ? {type: type} : {}).tree());
};

BasicClient.prototype.iq = function(to, query, callback) {
	var n = this._iq++;
	this._iqCallback[n] = callback;
	var attrs = {
		type:"get",
		id: n
	};
	if(to != null) {
		attrs.to = to;
	};
	this.xmpp.send(new xmpp.Element('iq', attrs).cnode(query).tree());
};


var Client = function(params, callback) {
	BasicClient.call(this, params, callback);
	var jabber = this;
	this.color = (params.color != null) ? params.color : 'blue';
	this.debug = true;
	this.rooms = {};
	this._isReady = false;
	this._iqHandler = {};
	this._iqCallback = {};
	this.presences = {};
	this.roster = {};
	this.xmpp.addListener('stanza', function(stanza) {
		//sys.debug('STANZA: '[jabber.color] + ('<' + stanza.name + '> ').bold[jabber.color] + stanza);
		if(stanza.name == 'iq') {
			switch(stanza.attrs.type) {
				case 'result':
					jabber._debug('IQ result: ' + stanza);
					jabber.emit('iq:result', stanza.attrs.id, stanza);
				break;
				case 'error':
					jabber._debug('IQ error :' + stanza);
					jabber.emit('iq:error', stanza.attrs.id, stanza);
				break;
				default:
					jabber._debug(('IQ: ' + stanza)[jabber.color]);
					jabber.emit('iq', stanza);
					var q = stanza.getChild('query');
					if(q.attrs.xmlns != null && jabber._iqHandler[q.attrs.xmlns] != null) {
						jabber._iqHandler[q.attrs.xmlns].call(jabber, stanza);
					} else {
						jabber.emit('iq:unknow', stanza);
					}
				break;
			}
		}
		if(stanza.name == 'presence') {
			var jfrom = new xmpp.JID(stanza.attrs.from);
			var roomName = jfrom.user + '@' + jfrom.domain;
			if(stanza.attrs.type == 'error') {
				sys.error(stanza.toString().inverse);
				if(jabber.rooms[roomName] != null) {
					jabber.rooms[roomName].emit('presence:error', stanza.getChild('error'), stanza);
				} else {
					jabber.emit('presence:error', stanza.getChild('error'), stanza);
				}
			} else {
				if(jabber.rooms[roomName] != null) {
					jabber.rooms[roomName].emit('presence', stanza.attrs.from, stanza);
				} else {
					jabber.emit('presence', stanza.attrs.from, stanza);
				}
			}
		}
		if(stanza.name == 'message') {
			var from = stanza.attrs.from;
			if(stanza.attrs.type == 'groupchat') {
				jabber.emit('groupchat', from, stanza.getChild('body').getText(), stanza);
			} else {
				jabber._debug('MESSAGE: ' + stanza);
				var event_ = stanza.getChild('event', 'http://jabber.org/protocol/pubsub#event');
				if(event_ != null) {
					jabber.emit('pubsub:event', from, event_, stanza);
				} else {
					jabber.emit('message', from, stanza.getChild('body').getText(), stanza);
				}
			}
		}
	});
	this.xmpp.addListener('online', function() {
		jabber._debug("[Info] xmpp connection");
		jabber.presence();
		jabber.emit('online');
		jabber.askForRoster(function(roster) {
			//jabber._debug("ROSTER : "[jabber.color] + JSON.stringify(roster));
			if(callback != null) {
				callback.call(jabber);
			}
		});
	});
	this.addListener('groupchat', function(from, msg, stanza) {
		fromName = from.split('/')[0];
		jabber.rooms[fromName].emit('message', from, msg, stanza);
	});
	this.addListener('iq:result', function(id, stanza){
		jabber._iqCallback[id].call(jabber, stanza);
	});
	this.addListener('presence', function(from, stanza) {
		if(stanza.attrs.type == 'error') {
			var jfrom = new JID(stanza.attrs.from);
			var roomName = jfrom.user + '@' + jfrom.domain;
			if(this.rooms[roomName] != null) {
				//[FIXME]
			}
		} else {
			jabber.presences[from] = stanza.attrs.type;
		}
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
			.c('version').t('0.0.1').up()
			.c('os').t(process.platform).up()
			.tree()
		);
	});
	this.addListener('iq', function(stanza) {
		sys.debug(stanza.getChild('query').toString().yellow);
	});
	this.addListener('iq:error', function(id, stanza) {
		this._debug(stanza.toString().red.invert);
	});
};

sys.inherits(Client, BasicClient);
exports.Client = Client;

Client.prototype._debug = function(txt) {
	if(this.debug) {
		sys.debug(txt);
	}
};

Client.prototype.registerIqHandler = function(xmlns, action) {
	this._iqHandler[xmlns] = action;
};

Client.prototype.askForRoster = function(callback) {
	var jabber = this;
	this.iq(null, new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
		iq.getChild('query', 'jabber:iq:roster').getChildren('item').forEach(function(child) {
			jabber.roster[child.attrs.jid] = {
				name: child.attrs.jid,
				subscription: child.attrs.subscription};
		});
		if(callback != null) {
			if(! jabber._isReady) { //[FIXME] will not work if askForRoster is called again
				jabber._isReady = true;
				callback.call(jabber, jabber.roster);
			}
		}
		jabber.emit('roster', jabber.roster);
	});
};

Client.prototype.iqSet = function(to, query, callback) {
	var n = this._iq++;
	if(callback != null) {
		this._iqCallback[n] = callback;
	}
	var attrs = {
		type:"set",
		id: n
	};
	if(to != null) {
		attrs.to = to;
	}
	this.xmpp.send(new xmpp.Element('iq', attrs).cnode(query).tree());
};

Client.prototype.resultIq = function(iqGet, result) {
	this.xmpp.send(new xmpp.Element('iq', {
		type: 'result',
		from: iqGet.attrs.to,
		to: iqGet.attrs.from,
		id: iqGet.attrs.id
	}).cnode(result).tree());
};

Client.prototype.canonicalRoomName = function(room) {
	if(room.indexOf('@') > 0) {
		return room;
	} else {
		return room + '@conference.' + this.client.jid.domain;
	}
};

Client.prototype.room = function(name, callback) {
	var room = this.canonicalRoomName(name);
	if(this.rooms[room] == null) {
		this.rooms[room] = new Room(this, room, callback);
	}
	return this.rooms[room];
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

Client.prototype.publish = function(to, node, publish) {
	this.iqSet(to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.cnode(publish)
		.tree()
		);
};

Client.prototype.suscribe = function(to, node, callback) {
	if(to == null) {
		to = 'pubsub.' + this.jid.domain;
	}
	this.iqSet(to, new xmpp.Element('pubsub', {xmlns: 'http://jabber.org/protocol/pubsub'})
		.c('subscription', {
			node: node,
			jid: this.jid.user + '@' + this.jid.domain
		})
		.tree()
	);
};

