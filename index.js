'use strict';
const ws = require('ws');

class connection extends ws {
	constructor(room = 'welcome', uri = 'https://instant.leet.nu', options = { origin: 'instant.leet.nu' }, ...callback) {
		super(uri + '/room/' + room + '/ws', options);
		this.room = room;
		this.seq = 0;
		this.id = '';
		this.uuid = '';
		this._response = [];
		// Setting the basics for the connection.
		this.once('open', data => {
			callback.forEach(f => f(data));
			this.on('message', this._handleMsg);
			this.on('response', this._handleResponse);
		});
		this.once('identity', data => {
			data = data.data;
			this.id = data.id;
			this.uuid = data.uuid;
			this.emit('ready');
		});
		this.on('who', data => {
			this.send(JSON.stringify({
				type: 'unicast',
				to: data.from,
				seq: this.seq++,
				data: {
					type: 'nick',
					nick: this._nick,
					uuid: this.uuid
				}
			}));
		});
	}

	_handleMsg(data, flags) {
		try {
			const dt = JSON.parse(data);
			this.emit(dt.type, dt);
			if(dt.type === 'broadcast')
				this.emit(dt.data.type, dt);
		} catch (e) {
			console.error({error: e, data: data});
		}

		return this
	}
	
	post(msg, parent = null, ...callback) {
		this.postAs(msg, parent, this.nick, ...callback)

		return this
	}

	postAs(msg, parent = null, nick, ...callback) {
		this._queueResponse(callback);

		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {
				type: 'post',
				nick: nick,
				text: msg,
				parent: parent
			}
		}));

		return this
	}

	pm(msg, recipient, ...callback) {

		this._queueResponse(callback);

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
		}));
		return this

	}

	ping(...callback) {
		this.send(JSON.stringify({
			seq: this.seq++,
			type: 'ping'
		}));

		this.once('pong', data => {
			callback.forEach(f => f());
		});

		return this
	}

	who(...callback) {
		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {type: 'who'}
		}));
		callback.forEach(f => f());

		return this
	}

	nick(nick, ...callback) {

		this._queueResponse(callback);

		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq++,
			data: {
				type: 'nick',
				uuid: this.uuid,
				nick: nick
			}
		}));

		this._nick = nick;

		return this
	}

	_handleUnicast(data) {
		// if we have a response ready and a response is given
	}

	_queueResponse(callback) {
		this._response[this.seq] = callback;
	}

	_handleResponse(data) {
		if (this._response[this.seq])
			this._response[data.seq].forEach(f => f(data));
	}


}

module.exports = connection;
