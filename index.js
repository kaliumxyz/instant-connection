'use strict';
const ws = require('ws');

class connection extends ws {
	constructor(room = 'welcome', uri = 'https://instant.leet.nu', options = { origin: 'instant.leet.nu' }, ...callback) {
		super(uri + '/room/' + room + '/ws', options);
		this.room = room;
		this.seq = 0;
		this.id = '';
		this.uuid = '';
		this._log = {};
		this._response = [];
		// Setting the basics for the connection.
		this.once('open', data => {
			callback.forEach(f => f(data));
			this.on('message', this._handleMsg);
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
			if (dt.type === 'response')
				this.on('response', this._handleResponse);
			this.emit(dt.type, dt);
			if (dt.type === 'broadcast')
				this.emit(dt.data.type, dt);
		} catch (e) {
			console.error({error: e, data: data});
		}

		return this;
	}

	post(msg, parent = null, ...callback) {
		this.postAs(msg, parent, this._nick, ...callback);

		return this;
	}

	postAs(msg, parent = null, nick, ...callback) {
		this
			._queueResponse(callback)
			.broadcast({
				type: 'post',
				nick: nick,
				text: msg,
				parent: parent
			});

		return this;
	}

	pm(msg, recipient, ...callback) {
		this
			._queueResponse(callback)
			.unicast({
				text: msg,
				type: 'privmsg'
			}, recipient);

		return this;
	}

	ping(...callback) {
		this.send(JSON.stringify({
			seq: this.seq++,
			type: 'ping'
		}));

		this.once('pong', data => {
			callback.forEach(f => f());
		});

		return this;
	}

	who(...callback) {
		this.broadcast({type: 'who'});
		callback.forEach(f => f());

		return this;
	}

	nick(nick, ...callback) {
		this
			._queueResponse(callback)
			.broadcast({
				type: 'nick',
				uuid: this.uuid,
				nick: nick
			});

		this._nick = nick;

		return this;
	}

	unicast(data, to) {
		this.send(JSON.stringify({
			type: 'unicast',
			seq: this.seq,
			to: to,
			data: data
		}));

		return this;
	}

	broadcast(data) {
		this.send(JSON.stringify({
			type: 'broadcast',
			seq: this.seq,
			data: data
		}));

		return this;
	}

	_queueResponse(callback) {
		this._response[++this.seq] = callback;
		return this;
	}

	_handleResponse(data) {
		if (this._response[this.seq])
			this._response[data.seq].forEach(f => f(data));
		return this;
	}
}

module.exports = connection;
