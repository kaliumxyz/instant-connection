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
