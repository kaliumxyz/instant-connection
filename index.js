'use strict'
const ws = require('ws')
const log = console.log.bind(this)

class connection extends ws {
	constructor (room = 'welcome', uri = 'https://instant.leet.nu', options = {origin: 'instant.leet.nu'}, ...callback) {
		super(uri + '/room/' + room, options)
		this.room = room

		// Setting the basics for the connection.
		this.on('open', data => {
			const dt = JSON.stringify(data)
			log(dt)
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this.handleMsg)
		})

	}

	//	data types observed:
	//	- ping: reply with pong, the timestamp and seq
	handleSend(type, data) {
		log(data)

		if (data)
			data = ', "data":' + JSON.stringify(data)
		else
			data = ''
		this.send(`{
		"type": "${type}"
		${data}
		}`)
		function pong(seq) {
			this.send(`{"type": "pong", "seq": ${seq}}`)

		}
	}

	handleMsg(data, flags) {
		const dt = JSON.stringify(data)
		log(dt)
		if(dt.type == 'pong')
		this.handleSend.pong(dt.seq)

	}

	quit() {

	}
	
	sendMsg() {
		
	}
	
	nick() {
		
	}
}

module.exports = connection