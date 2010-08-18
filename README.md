XMPP Client for node
====================

Node-xmpp is a cute but low level tool, so, here is xmpp client.

IQ are handled with callback, presence and roster is manageable, every xmpp events become a node event. This client tries to be as polite as Psi.

Install
-------

You need the low level node xmpp tools, and colors.

    npm install .

Test
----

Async testing is a sport, you need colors for that :

    npm install nodeunit

You have to edit a new file in `test/conf.js` :

    exports.conf = {
      a: {
        jid: 'andre@gmail.com',
        password: '42',
        color: 'red',
        host: 'talk.google.com'
      },
      b: {
        jid: 'bob@jabber.org',
        password: 'beuha'
      }
    }

Then, you can launch test :

    node test/test.js

API
---

Client handle all the xmpp stack with object, callback, event and handlers. All in async.

### Client ###

The first object is the client :

    var c = new Client({
      jid: 'bob@jabber.org',
      password: 'beuha'
    }, function() {
        sys.debug("I'm connected");
    });
You instiante it with xmpp params and callback, tirggered when connection is done, and roster fetched. All your work should be inside the callback, outside, you don't know your state.

The client throw events :

 * _presence_
 * _presence:error_
 * _message_

And some attributes are available :

 * _presences_
 * _roster_

### IQ ###
Iq is handled quietly. You can ask someone with a callback, for the response.

    var jabber = this;
    this.iq(new xmpp.Element('query', {xmlns: 'jabber:iq:roster'}), function(iq) {
    	iq.getChild('query', 'jabber:iq:roster').children.forEach(function(child) {
    		//iterating over evrybody
    		sys.debug(child.attrs.jid);
    	});
    });

Answering a distant iq is handled with an handler. Default object handles :

 * _http://jabber.org/protocol/disco#info_ :discovery
 * _jabber:iq:last_ : last action
 * _jabber:iq:version_ : client version

Here is an example :

    var jabber = this;
    this.registerIqHandler('jabber:iq:last', function(stanza) {
    	jabber.resultIq(stanza, new xmpp.Element('query', {
    		xmlns: 'jabber:iq:last', seconds:'1'})
    		.tree()
    	);
    });


Not handled iq throws an event : _iq:unknow_

### Room ###

Just like Client, room is created with a callback, triggered when presence is return from the server.

    this.room('beuha', function(status) {

    });

Events :

 * _presence_
 * _message_

Available attributes :

 * _affiliation_
 * _role_


### PubSub ###

Pubsub support is experimental for now.