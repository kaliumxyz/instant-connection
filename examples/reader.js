#!/bin/env node
'use strict';
/* libs */
const Connection = require('../')

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

// instantiate the connection with the room
const connection = new Connection(room)
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
connection.once('ready', _ => {
	// on any message (any event in the chat) log to our console
	connection.on('message', console.log)
})
