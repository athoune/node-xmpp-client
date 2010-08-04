var sys = require('sys'),
	xmpp = require('xmpp'),
	events = require('events');

var jid = function(plain) {
	var tmp = plain.split('/');
	var j = {};
	j.resource = (tmp.length == 1) ? null : tmp[1];
	tmp = tmp[0].split('@');
	j.node = tmp[0];
	j.domain = tmp[1];
	return j;
};

exports.jid = jid;

var Client = function(host, jid, password) {
	events.EventEmitter.call(this);
	var jabber = this;
};

sys.inherits(Client, events.EventEmitter);
exports.Client = Client;