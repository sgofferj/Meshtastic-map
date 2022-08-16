var serialport = require('serialport');
const path = require('path');
const protobuf = require('protobufjs');
const root = protobuf.loadSync(path.join(__dirname, '../Meshtastic-protobufs/mesh.proto'));
const toRadio = root.lookupType('ToRadio');
const peerInfo = root.lookupType('ToRadio.PeerInfo');
const fromRadio = root.lookupType('FromRadio');
const position = root.lookupType('Position');
const user = root.lookupType('User');

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports.writePacket = (port, data) => {
  const dlen = data.length;
  const header = Buffer.from([0x94, 0xc3, (dlen >> 8), dlen]);
  const wakeup = Buffer.from([0x94, 0x94, 0x94, 0x94]);
  port.write(wakeup);
  sleep(100);
  port.write(header);
  port.write(data);
}

module.exports.wantConfigPacket = (id) => {
  var message = toRadio.create({
    wantConfigId: id
  });
  var buffer = Buffer.from(toRadio.encode(message).finish());
  return buffer;
}

module.exports.pingPacket = (id) => {
}

module.exports.decodeFromRadio = (data) => {
  if (data.includes(0x94)) {
    const index = data.indexOf(0x94);
    const C3 = data[index + 1];
    const msb = data[index + 2];
    const lsb = data[index + 3];
    const protolen = lsb + (msb << 8);

    if (C3 == 0xc3 && data.length >= index + 4 + protolen) {
      const buffer = data.subarray(index + 4, index + 4 + protolen);
      try {
        const message = fromRadio.decode(buffer);
        const reply = fromRadio.toObject(message);
        return reply;
      } catch (e) {
        console.log(e);
      }
    }
  }
}

module.exports.decodePosition = (buffer) => {
  try {
    const message = position.decode(buffer);
    const reply = position.toObject(message);
    return reply;
  } catch (e) {
    console.log(e);
  }
}

module.exports.decodeUser = (buffer) => {
  try {
    const message = user.decode(buffer);
    const reply = user.toObject(message);
    return reply;
  } catch (e) {
    console.log(e);
  }
}

module.exports.decodeMac = (buffer) => {
  var id = "";
  for (var pos=2; pos<=5; pos++) {
    var num = buffer[pos].toString(16);
    num = "00".substr(0, 2 - num.length) + num;
    id += num;
  }
  return id;
}
