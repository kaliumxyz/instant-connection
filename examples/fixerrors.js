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

const queue = []

connection.once('ready', ev => {

	connection.nick('K9');
	// on a broadcast, reply to the frigging post with one random choice
	connection.on('broadcast', ev => {
		if(ev.data.type === 'post' && ev.data.nick === "K" &&  ev.data.text){
			if(queue.length)
				queue.pop()()
			if(ev.data.text.startsWith('!reverse'))
				queue.push( _ =>connection.post(ev.data.text.split('').reverse().join('')))
			let match = ev.data.text.match(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)
			// match.forEach((x,i) => console.log(x,i))
			if(match)
				connection.post(match.map(x => `<${x}>`).join(' '), ev.data.parent)
		}
	});
});


