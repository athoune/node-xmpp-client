XMPP Client for node
====================

Node-xmpp is a cute but low level tool, so, here is xmpp client.

Install
-------

    npm install xmpp

Tests
-----
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
