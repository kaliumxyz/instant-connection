import test from 'ava'
const connection = require('./')

test('can create connection',t => {
	t.true(new connection('test') instanceof connection)
})

test('can connect', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.on('ready', data => testConnection.ping(resolve))
	})
	
	t.is(await testPromise)
})

test('can change name', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.on('ready', data => testConnection.nick("pew",resolve))
	})

	t.truthy(await testPromise)
})

test('can send msg', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.on('ready', data => testConnection.nick("pew", _ => {
			testConnection.post("post", null, resolve)
		}))
	})

	t.truthy(await testPromise)
})

test('can reply', async t => {
	const testPromise = new Promise((resolve, reject) => {
		const testConnection = new connection('test')
		testConnection.on('ready', data => testConnection.nick("pew", _ => {
			testConnection.post("post", null, data => {
				testConnection.post("post", data.data.id, resolve)
			}) 
		}))
	})

	t.truthy(await testPromise)
})
