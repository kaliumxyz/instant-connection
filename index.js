'use strict';
const ws = require('ws');

class connection extends ws {
  constructor(room = 'welcome', uri = 'wss://instant.leet.nu', options = { origin: 'instant.leet.nu', visible: true, nick: undefined }, ...callback) {
    super(uri + '/room/' + room + '/ws', options);
    this.room = room;
    this.seq = 0;
    this.id = '';
    this.uuid = '';
    this._response = [];
    this._userlist = [];
    this._nick = options.nick;
    this.visible = options.visible;
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

    this.setMaxListeners(1028); // solve all problems in life by sweeping them under the curtain.
    // TODO: add option for log replies
    this.on('who', data => {
      if (this.visible === true) {
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
      }
    });
  }

  _handleMsg(data, flags) {
    try {
      const json = JSON.parse(data);
      switch (json.type) {
      case 'response':
        this._handleResponse(json);
        break;
      case 'broadcast':
        this.emit(json.type, json);
        this.emit(json.data.type, json);
        break;
      case 'unicast':
        this.emit(json.type, json);
        this.emit(json.data.type, json);
        break;
      case 'joined':
        if (this._userlist[json.data.id]) {
          this._userlist[json.data.id].left = false;
        } else {
          this._userlist[json.data.id] = json.data;
        }
        break;
      case 'left':
        this._userlist[json.data.id].left = true;
        break;
      default:
        this.emit(json.type, json);
        break;
      }
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

  cast(data, to) {
    if (to === undefined) {
      return broadcast(data);
    } else {
      return unicast(data, to);
    }
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
