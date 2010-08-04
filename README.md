XMPP Client for node
====================

Node-xmpp is a cute but low level tool, so, here is xmpp client.

IQ are handled with callback, presence and roster is manageable, every xmpp events become a node event. This client tries to be as polite as Psi.

Install
-------

You need the low level node xmpp tools.

    npm install xmpp

Test
----

Async testing is a sport, you need colors for that :

    npm install colors
    npm install nodeunit

You have to edit a new file in `test/conf.js` :

    exports.conf = {
      a: {
        jid: 'andre@gmail.com',
        password: '42'
      },
      b: {
        jid: 'bob@jabber.org',
        password: 'beuha'
      }
    }

Then, you can launch test :

    node test/test.js
