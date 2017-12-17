'use strict'
const ws = require('ws')
/* TODO:
 * - uuid.
 */
class connection extends ws {
	constructor(room = 'welcome', uri = 'https://instant.leet.nu', options = { origin: 'instant.leet.nu' }, ...callback) {
		super(uri + '/room/' + room + '/ws', options)
		this.room = room
		this.seq = 0
		this.id = ''
		this.uuid = ''
		// Setting the basics for the connection.
		this.once('open', data => {
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this.handleMsg)
		})
		this.once('identity', data => {
			this.id = data.id
			this.uuid = data.uuid
		})
		this.on('who', data => {
			this.send(JSON.stringify({
				type: 'unicast',
				seq: this.seq++,
				data: {
					type: 'nick',
					nick: this.nick
				}
			}))
		})

	}

	handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
	}

	post(msg, parent = null, ...callback) {
		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {
				type: 'post',
				nick: this.nick,
				text: msg,
				parent: parent
			}
		}))

		this.once('response', data => {
			callback.forEach(f => f(data))
		})
	}

	pm(msg, recipient, ...callback) {

		this.send(JSON.stringify({
			type: 'unicast',
			seq: this.seq++,
			uuid: this.uuid,
			to: recipient,
			data: {
				nick: this.nick,
				text: msg,
				type: 'privmsg',
			}
		}))

		this.once('response', data => {
			callback.forEach(f => f(data))
		})
	}

	ping(...callback) {
		this.send(JSON.stringify({
			seq: this.seq++,
			type: 'ping'
		}))

		this.once('pong', data => {
			callback.forEach(f => f())
		})
	}
	who(...callback) {
		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {type: 'who'}
		}))
		callback.forEach(f => f())
	}

	nick(nick, ...callback) {
		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {
				type: 'nick',
				uuid: this.uuid,
				nick: nick
			}
		}))

		this.once('response', data => {
			this.nick = nick
			callback.forEach(f => f(data))
		})
	}

}

module.exports = connection
