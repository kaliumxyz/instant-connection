import test from 'ava'
const connection = require('./')

test('can create connection',t => {
	t.true(new connection('test') instanceof connection)
})

test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', data => testConnection.ping(resolve))
		setTimeout(() => reject('timed out'), 10000)
	})
	
	t.is(await testPromise)
})

test('can change name', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', data => testConnection.nick("can change name",resolve))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.truthy(await testPromise)
})

test('can send msg', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.once('ready', data => testConnection.nick("can send msg", _ => {
			testConnection.post("can send msg", null, () => resolve(true))
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.true(await testPromise)
})

test.skip('can send 256 msgs', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
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
		const testConnection = new connection('test')
		testConnection.once('ready', data => testConnection.nick("can reply", _ => {
			testConnection.post("post", null, data => {
				testConnection.post("can reply", data.data.id, resolve)
			}) 
		}))
		setTimeout(() => reject('timed out'), 10000)
	})

	t.truthy(await testPromise)
})
