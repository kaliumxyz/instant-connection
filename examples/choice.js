#!/bin/env node
"use strict";
const readline = require('readline');

const Connection = require('../');

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, `choose.log`), { flags: 'a' });
function log(...text) {
		console.log(text)
		text.forEach(text => {
			logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`)
		})
	}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1]

const connection = new Connection(room);

// on a broadcast, reply to the frigging post with one random choice
connection.on('broadcast', ev => {
	log(ev)
	if(ev.data.type === 'post' && ev.data.text)
		if(ev.data.text.startsWith('.choose')){
			const options = ev.data.text
				.substring(7)
				.split(',');
			log(options);
			connection.post(options[Math.floor(Math.random() * options.length)], ev.id);
		}
});
