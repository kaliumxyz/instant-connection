import test from 'ava'
const Connection = require('./')

test('can create connection',t => {
	t.true(new Connection('test') instanceof Connection)
})

test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		testConnection.once('ready', data => testConnection.ping(resolve))
		setTimeout(() => reject('timed out'), 10000)
	})
	
	t.is(await testPromise)
})

test('can change name', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		testConnection.once('ready', data => testConnection.nick("can change name",resolve))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.truthy(await testPromise)
})

test('can send msg', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		testConnection.once('ready', data => testConnection.nick("can send msg", _ => {
			testConnection.post("can send msg", null, () => resolve(true))
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.true(await testPromise)
})

test('can send msg as', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		testConnection.once('ready', data => testConnection.nick("can send msg", _ => {
			testConnection.postAs("can send msg as", null, 'wut', () => resolve(true))
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.true(await testPromise)
})

test.skip('can send 256 msgs', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		// for the sake of the callback, we shall count down.
		let post_counter = 0 
		testConnection.once('ready', data => testConnection.nick("pew", _ => {
			for(let i = 0; i < 256; i++){
				testConnection.post(`test post #${i}`, null, () => {
					post_counter += 1
					if(post_counter === 256)
						resolve(true)
				})
			}
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.true(await testPromise)
})

test('can reply', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new Connection('test')
		testConnection.once('ready', data => testConnection.nick("can reply", _ => {
			testConnection.post("post", null, data => {
				testConnection.post("can reply", data.data.id, resolve)
			}) 
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.truthy(await testPromise)
})

test('can send dm', async t => {
	// const testPromise = new Promise(async (resolve, reject) => {
		// const testPing = new connection('test')
		// await new Promise((res, rej) => {
		// 	testPing.once('ready', data => testConnection.nick("Ping", _ => {
		// 		res()
		// 	}))
		// })
	const ping = await new Promise(res => {
		const connection = new Connection('test')
		connection
			.once('ready', function(data) {
				connection.nick('ping')
				res(connection)
			})
			.on('error', function(err) {
				throw new Error(err);
			})
	})

	const pong = await new Promise(res => {
		const connection = new Connection('test')
		connection
			.once('ready', function(data) {
				connection.nick('pong')
				res(connection)
			})
			.on('error', function(err) {
				throw new Error(err)
			})
			.on('unicast', console.log)
	})

	const msg = 'this is a test DM'


	const reply = await new Promise(res => {
		console.log(pong.id)
		ping
			.pm(msg, pong.id)
			.on('unicast', res)
	})

	console.log(reply)
	
	t.is(reply, msg)
})

test.skip('snoop', async t => {
	const snoop = await new Promise(res => {
		const connection = new Connection('test')
		connection
			.once('ready', function(data) {
				connection.nick('snoop')
			})
			.on('message', console.log)
			.on('error', function(err) {
				res(connection)
				throw new Error(err);
			})
	})

	t.is(reply, msg)
})

test


