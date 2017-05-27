# instant-connection [![Build Status](https://travis-ci.org/kaliumxyz/instant-connection.svg?branch=master)](https://travis-ci.org/kaliumxyz/instant-connection)
> make connections to [instant.io](https://instant.io/) :D.

## install
simply download it from npm.
```
$ yarn add instant-connection
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
$ yarn test
```

## license
MIT © [Kalium](https://kalium.xyz)
