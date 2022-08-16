reconnect-tls
=============

Reconnect a tls/ssl stream when it goes down.

## Installation

Via [npm](https://npmjs.org):

```
npm install reconnect-tls
```

## Usage

```js
var reconnect = require('reconnect-tls');

var options = {
	host: '127.0.0.1',
	post: 8000,
	key: fs.readFileSync('client-key.pem'),
	cert: fs.readFileSync('client-cert.pem')
};

reconnect(function(stream){
	stream.on('data', function(data){
		console.lod('data', data);
	});
}).connect(options);
```