#!/usr/bin/env node
'use strict';
/* libs */
const Connection = require('../../');
const readline = require('readline');
/* config */
const option_definitions = [
	{ name: 'nick', alias: 'n', type: String },
	{ name: 'room', alias: 'r', type: String },
	{ name: 'count', alias: 'c', type: Number }
];

const options = require('command-line-args')(option_definitions);

const room = options.room || 'test';
const nick = options.nick || 'K';
const max = options.count || 100;
let total = 0;
let selected = 1;

// instantiate the connection with the room
const connection = new Array();

const settings = [room];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (line) => {
	// if its a command.

	const command = line.match(/!\w+/)[1];

	if (command) {
		line = line.replace(/!\w+/,'');

		switch(command){
		case('!post'):
			connection.forEach(con => con.post(line));
			break;
		case('!nick'):
			connection.forEach(con => con.nick(line));
			break;
		case('!select'):
			if(typeof +line  === 'number')
				selected = line;
			else
				console.log('Give me a number');
			break;
		case('!postas'):
			connection[selected].post(line);
			break;
		}
	}
});

// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
spawn(new Connection(...settings));

function spawn(con) {
	con.once('ready', () => {
		con.nick(nick);
		connection.push(con);
		if(++total<max)
			spawn(new Connection(...settings));
	});
}

