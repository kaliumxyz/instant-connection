#!/usr/bin/env node
'use strict';
const Connection = require('../');
const connection = new Connection('welcome', 'http://localhost:8080');
connection.on('message', console.log);
// connection.once('open', _ => connection.nick('post every 2 seconds'));

let i = 0;

// setInterval(_ => connection.post(`post ${i++}`), 2000);
