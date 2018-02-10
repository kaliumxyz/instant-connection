# instant-connection [![Build Status](https://travis-ci.org/kaliumxyz/instant-connection.svg?branch=master)](https://travis-ci.org/kaliumxyz/instant-connection)
> make connections to [instant](https://instant.leet.nu/) :D.

this is a sister of the [euphoria-connection](https://github.com/kaliumxyz/euphoria-connection) lib.

## install
simply download it from npm.
```
$ npm install instant-connection
```


## usage
Require it and you can proceed to create new connections :D.
```js
const instantConnection = require('instant-connection')
const connection = new instantConnection()
```

connections will default to the &test room. Once you've created a connection you can send data over it with the send() method.

## tests
```
$ npm test
```

## license
MIT © [Kalium](https://kalium.xyz)
