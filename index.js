'use strict'
const ws = require('ws')
/* TODO:
 * Xyzzy pointed out that JSON.parse is not a huge fan of invalid JSON,
 * We will run into problems when parsing something like: {"msg": """"}.
 * 
 * - uuid.
 * - logging features.
 */
class connection extends ws {
	constructor (room = 'welcome', uri = 'https://instant.leet.nu', options = {origin: 'instant.leet.nu'}, ...callback) {
		super(uri + '/room/' + room + "/ws", options)
		this.room = room
		this.seq = 0
		// Setting the basics for the connection.
		this.once('open', data => {
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this.handleMsg)
		})
		this.on('who', data => {
			this.send(`{
				"type": "unicast",
				"seq": ${this.seq++},
				"data": {
				"type": "nick",
				"nick": "${this.nick}"
				}
			}`)
		})
	}

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
	}

	post(msg, parent = null, ...callback) {

		this.send(`{
		"type": "broadcast",
		"seq": ${this.seq++},
		"data": {
		"type": "post",
		"nick": "${this.nick}",
		"text": "${msg}",
		"parent": ${parent}
		}
		}`)
	
		this.once('reply', data => {
			callback.forEach(f => f(data))
		})
	}

	pm(msg, recipient, ...callback) {

		this.send(`{
		"type": "unicast",
		"seq": ${this.seq++},
		"to": ${recipient},
		"data": {
		"nick": "${this.nick}",
		"text": "${msg}",
		"type": "privmsg",
		}
		}`)
	
		this.once('reply', data => {
			callback.forEach(f => f(data))
		})
	}

	ping(...callback) {
		this.send(`{
		"seq": ${this.seq++},
		"type": "ping"
		}`)
	
		this.once('pong', data => {
			callback.forEach(f => f())
		})
	}
	
	nick(nick, ...callback) {
		this.send(`{
		"type": "broadcast",
		"seq": ${this.seq++},
		"data": {
		"type": "nick",
		"nick": "${nick}"
		}
		}`)
	
		this.once('reply', data => {
			this.nick = nick
			callback.forEach(f => f(data))
		})
	}
}

module.exports = connection