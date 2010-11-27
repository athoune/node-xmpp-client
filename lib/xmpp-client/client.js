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
		this.askForRoster(function(roster) {
			callback.apply(this);
		});
	});
};

sys.inherits(Client, BasicClient);
exports.Client = Client;

Client.prototype.askForRoster = function(callback) {
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
