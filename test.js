import test from 'ava';
const Connection = require('./');
const uri = 'wss://instant.leet.nu';

test('can create connection', t => {
  t.true(new Connection('test', uri) instanceof Connection);
});

test('can connect', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    testConnection.once('ready', data => testConnection.ping(resolve));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.is(await testPromise);
});

test('can change name', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    testConnection.once('ready', data => testConnection.nick('can change name', resolve));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.truthy(await testPromise);
});

test('can send msg', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    testConnection.once('ready', data => testConnection.nick('can send msg', _ => {
      testConnection.post('can send msg', null, () => resolve(true));
    }));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.true(await testPromise);
});

test('can send msg as', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    testConnection.once('ready', data => testConnection.nick('can send msg', _ => {
      testConnection.postAs('can send msg as', null, 'can send msg as', () => resolve(true));
    }));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.true(await testPromise);
});

test.skip('can send 256 msgs', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    // for the sake of the callback, we shall count down.
    let postCounter = 0;
    testConnection.once('ready', data => testConnection.nick('pew', _ => {
      for (let i = 0; i < 256; i++)
        testConnection.post(`test post #${i}`, null, () => {
          postCounter += 1;
          if (postCounter === 256)
            resolve(true);
        });
    }));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.true(await testPromise);
});

test.skip('can send 10000 msgs', async t => {
  const n = 10000;
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    // for the sake of the callback, we shall count down.
    let postCounter = 0;
    testConnection.once('ready', data => testConnection.nick('pew', _ => {
      for (let i = 0; i < n; i++)
        testConnection.post(`test post #${i}`, null, () => {
          postCounter += 1;
          if (postCounter === n)
            resolve(true);
        });
    }));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.true(await testPromise);
});

test('can reply', async t => {
  const testPromise = new Promise((resolve, reject) => {
    const testConnection = new Connection('test', uri);
    testConnection.once('ready', data => testConnection.nick('can reply', _ => {
      testConnection.post('post', null, data => {
        testConnection.post('can reply', data.data.id, resolve);
      });
    }));
    setTimeout(() => reject('timed out'), 10000);
  });

  t.truthy(await testPromise);
});

test('can send dm', async t => {
  const ping = await new Promise((resolve, reject) => {
    const connection = new Connection('test', uri);
    connection
      .once('ready', function(data) {
        connection.nick('ping');
        resolve(connection);
      })
      .on('error', function(err) {
        throw new Error(err);
      });
  });

  const pong = await new Promise((resolve, reject) => {
    const connection = new Connection('test', uri);
    connection
      .once('ready', function(data) {
        connection.nick('pong');
        resolve(connection);
      })
      .on('error', function(err) {
        throw new Error(err);
      })
      .on('unicast', (ev) => {
        if (ev && ev.from === ping.id)
          pong.pm(msg, ping.id);
      });
  });

  const msg = 'this is a test DM';

  const reply = await new Promise((resolve, reject) => {
    ping
      .pm(msg, pong.id)
      .on('unicast', (ev) => {
        if (ev && ev.from === pong.id)
          resolve(ev.data.text);
      });
  });

  t.is(reply, msg);
});

test.skip('snoop', async t => {
  const snoop = await new Promise((resolve, reject) => {
    const connection = new Connection('test', uri);
    connection
      .once('ready', function(data) {
        connection.nick('snoop');
      })
      .on('message', console.log)
      .on('error', function(err) {
        resolve(connection);
        throw new Error(err);
      });
  });
  test.is(snoop);
});
