'use strict';
/* libs */
const Connection = require('../..');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

/* logging */
const logStream = fs.createWriteStream(path.join(__dirname, `monitor.log`), { flags: 'a' });
function log(...text) {
	console.log(text);
	text.forEach(text => {
		logStream.write(`${Date.now()} - ${JSON.stringify(text)}\n`);
	});
}

/* config */
// checks if an argument for the room is given else it will monitor test
const room = (process.argv.join().match(/-r,(\w+)/) || [,'test'])[1];

// instantiate the connection with the room
const connection = new Connection(room);
// set our funcitonal code on the ready event, so we are sure that the socket has been created and is connected to the server
connection.once('ready', _ => {
	connection.flag = 0;
	connection.on('unicast', (json) => {
		if (json.from === connection.from && connection.flag === 1) {
			connection.flag = 2;
			json.data.data.forEach(x => console.log(x));
		}
		if (connection.flag === 0 && json.data)
			if (json.data.length > 10) {
				connection.from = json.from;
				connection.flag = 1;
				connection.unicast({key: 'initial', type: 'log-request'}, json.from);
			}
	});
	connection.broadcast({type: 'log-query'});
	// connection.on('message', ev => console.log(chalk.yellow(ev)));
	// on any message send log to console
	// connection.on('post', ev => console.log(chalk.blue(`${ev.data.nick}: ${ev.data.text}`)));
	connection.on('post', ev => console.log(ev));
	connection.on('joined', ev => console.log(ev));
	connection.on('left', ev => console.log(ev));
	// join event (someone joining)
	// connection.on('joined', ev => console.log(chalk.green(`${ev.data.name || 'someone'} joined`)));
	// connection.on('left', ev => console.log(chalk.red(`${ev.data.name || 'someone'} left`)));
	// part event (someone leaving)
});
