var sys = require('sys'),
	xmpp = require('xmpp'),
	events = require('events');

var Jid = function(plain) {
	var tmp = plain.split('/');
	this.resource = (tmp.length == 1) ? null : tmp[1];
	tmp = tmp[0].split('@');
	this.node = tmp[0];
	this.domain = tmp[1];
};

exports.Jid = Jid;

var Client = function(_jid, password, host) {
	events.EventEmitter.call(this);
	var jabber = this;
	this.jid = new Jid(_jid);
	this.host = (host == null) ? this.jid.domain : host;
};

sys.inherits(Client, events.EventEmitter);
exports.Client = Client;