#!/bin/env node
"use strict";
const readline = require('readline');

const Connection = require('../');
const connection = new Connection('welcome');
connection.on('message', console.log);
