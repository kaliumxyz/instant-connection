#!/bin/env node
"use strict";
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const Connection = require('../');

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, `choose.log`), { flags: 'a' });
function log(...text) {
		text.forEach(text => {
			logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`)
		})
	}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

const connection = new Connection(room);

connection.once('ready', ev => {
	connection.nick('K');

	// on a broadcast, reply to the frigging post with one random choice
	connection.on('broadcast', ev => {
		log(ev)
		if(ev.data.type === 'post' && ev.data.nick !== "K" &&  ev.data.text)
			connection.post(ev.data.text.split('').reverse().join(''), ev.data.parent)
	});
});
