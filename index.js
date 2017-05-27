'use strict'
const ws = require('ws')
const log = console.log

class connection extends ws {
	constructor (room = 'welcome', uri = 'https://instant.leet.nu', options = {origin: 'instant.leet.nu'}, ...callback) {
		super(uri + '/room/' + room + "/ws", options)
		this.room = room

		// Setting the basics for the connection.
		this.on('open', data => {
			// log('opened!')
			const dt = JSON.stringify(data)
			// log(data)
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this.handleMsg)
			// this.on('error', console.log)
		})

	}

	//	data types observed:
	//	- ping: reply with pong, the timestamp and seq

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		// log(data)
		this.emit(dt.type)
	}

	quit() {
		this.send(`{
		"type": "part"
		}`)
	}
	
	post(msg, parent = null, ...callback) {

		this.send(`{
		"type": "broadcast",
		"data": {
		"type": "post",
		"nick": "${this.nick}",
		"text": "${msg}",
		"parent": "${parent}"
		}
		}`)
	
		this.once('reply', data => {
			// log('msg')
			callback.forEach(f => f())
		})
	}

	ping(...callback) {
		this.send(`{
		"type": "ping"
		}`)
	
		this.once('pong', data => {
			callback.forEach(f => f())
		})
	}
	
	nick(nick, ...callback) {
		this.send(`{
		"type": "broadcast",
		"data": {
		"type": "nick",
		"nick": "${nick}"
		}
		}`)
	
		this.once('identity', data => {
			// log('nick')
			this.nick = nick
			callback.forEach(f => f())
		})
	}
}

module.exports = connection