'use strict'
const ws = require('ws')
// let logger = require('k-log')
// logger = new logger('instantconn.log', true)
// const log = logger.log.bind(this)
const log = console.log

class connection extends ws {
	constructor (room = 'welcome', uri = 'https://instant.leet.nu', options = {origin: 'instant.leet.nu'}, ...callback) {
		super(uri + '/room/' + room + "/ws", options)
		this.room = room

		// Setting the basics for the connection.
		this.on('open', data => {
			log('opened!')
			const dt = JSON.stringify(data)
			// log(data)
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this.handleMsg)
		})

	}

	//	data types observed:
	//	- ping: reply with pong, the timestamp and seq

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		log(data)
		this.emit(dt.type)
	}

	quit() {
		this.send(`{
		"type": "part"
		}`)
	}
	
	sendMsg() {
		
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
		"type": "nick",
		"nick": "${nick}"
		}`)
	
		this.once('identity', data => {
			callback.forEach(f => f())
		})
	}
}

module.exports = connection