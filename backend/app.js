const util = require('util');
const express = require('express');
const routes = require('./routes/index');
const path = require('path');
const net = require('net');
const bodyParser = require('body-parser');
var serialport = require('serialport');
const serialDevice = '/dev/ttyUSB0';
const meshtastic = require('./lib/meshtastic-serial.js');
const objects = require('./lib/objectcache.js')

process.env.TZ = 'UTC';

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const app = express();
app.set('trust proxy', 'uniquelocal');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json()); // for parsing application/json
app.use('/', routes);
app.use(express.static(__dirname + "/../frontend"));

app.listen(3000, () => {
  console.log(`Meshtastic map server started`);
})

var myPort = new serialport(serialDevice, {
  baudRate: 921600,
});

myPort.on('open', () => {
  console.log('port open. Data rate: ' + myPort.baudRate);
  meshtastic.writePacket(myPort, meshtastic.wantConfigPacket(1234356));
});

myPort.on('data', (data) => {
  //console.log(data);
  var reply = meshtastic.decodeFromRadio(data);
  if (reply !== undefined) {
    if (reply.hasOwnProperty('rebooted')) {
      sleep(100);
      meshtastic.writePacket(myPort, meshtastic.wantConfigPacket(1234356));
    }
    if (reply.hasOwnProperty('packet')) {
      reply = reply.packet;
      rxTime = (reply.hasOwnProperty('rxTime')) ? new Date(reply.rxTime * 1000).toISOString() : "????-??-??T??:??:??.???Z";
      switch (reply.decoded.portnum) {
        case 1:
          var buffer = reply.decoded.payload
          var decoded = buffer.toString('utf-8');
          console.log(rxTime, "from", reply.from.toString(16), "to", reply.to.toString(16), "Message:", decoded)
          break;
        case 3:
          if (reply.decoded.hasOwnProperty("payload")) {
            var buffer = reply.decoded.payload
            var decoded = meshtastic.decodePosition(buffer);
              time = (decoded.hasOwnProperty('time')) ? new Date(decoded.time * 1000).toISOString() : "????-??-??T??:??:??.???Z";
              objects.storeUserPosition(reply.from.toString(16),decoded);
              console.log(rxTime, "from", reply.from.toString(16), "to", reply.to.toString(16), "Location:", decoded.latitudeI, decoded.longitudeI, decoded.altitude, time)
            } else {
              console.log(rxTime, "from", reply.from.toString(16), "to", reply.to.toString(16), "Location request")
            }
          break;
        case 4:
          var buffer = reply.decoded.payload
          var decoded = meshtastic.decodeUser(buffer);
          objects.storeUserInfo(reply.from.toString(16),decoded);
          console.log(rxTime, "from", reply.from.toString(16), "to", reply.to.toString(16), "Userinfo:", decoded.id, decoded.longName, decoded.shortName, decoded.hwModel)
          break;
        case 32:
          console.log(rxTime, "from", reply.from.toString(16), "to", reply.to.toString(16), "Reply app")
        default:
          console.log(reply);
          break;
      }
    } else if (reply.hasOwnProperty('nodeInfo')) {
      reply = reply.nodeInfo;
      objects.storeNodeInfo(meshtastic.decodeMac(reply.user.macaddr),reply);
      time = new Date(Date.now()).toISOString();
      console.log(time,"Nodeinfo:", meshtastic.decodeMac(reply.user.macaddr), reply.user.id, reply.user.longName, reply.user.shortName);

    } else {
    }
  }
});

myPort.on('error', (error) => {
  console.log('Serial port error: ' + error);
});

var sendPing = setInterval(function() {
  const id = Math.floor(Math.random() * Math.pow(2,32));
  meshtastic.writePacket(myPort, meshtastic.wantConfigPacket(id));
}, 270*1000);
