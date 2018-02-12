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
		this.response = []
		// Setting the basics for the connection.
		this.once('open', data => {
			callback.forEach(f => f(data))
			this.emit('ready')
			this.on('message', this._handleMsg)
			this.on('response', this._handleResponse)
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

	_handleMsg(data, flags) {
		const dt = JSON.parse(data)
		this.emit(dt.type, dt)
		if(dt.type === 'broadcast')
			this.emit(dt.data.type, dt.data)
	}

	post(msg, parent = null, ...callback) {

		this._queueResponse(callback)

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

	}

	pm(msg, recipient, ...callback) {

		this._queueResponse(callback)

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

		this._queueResponse(callback)

		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {
				type: 'nick',
				uuid: this.uuid,
				nick: nick
			}
		}))

		this.nick = nick

	}

	_queueResponse(callback) {
		this.response[this.seq] = callback
	}

	_handleResponse(data) {
		this.response[data.seq].forEach(f => f(data))
	}

}

module.exports = connection
