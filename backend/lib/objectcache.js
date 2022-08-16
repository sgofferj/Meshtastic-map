const util = require("util");
const NodeCache = require("node-cache");
const objectCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 10
});
const helper = require('./helper.js');

module.exports.storeUserInfo = (id,data) => {
  try {
    var obj = objectCache.get(id);
    if ( obj != undefined ){
      obj.id = data.id;
      obj.longName = data.longName;
      obj.shortName = data.shortName;
      obj.hwModel = data.hwModel;
      obj.lastHeard = new Date(Date.now());
    } else {
      obj = {
        "id": data.id,
        "longName": data.longName,
        "shortName": data.shortName,
        "hwModel": data.hwModel,
        "lat": null,
        "lon": null,
        "alt": null,
        "battery": null,
        "lastHeard": new Date(Date.now())
      }
    }
    success = objectCache.set(id, obj);
  } catch (e) {
    console.error('error', e, data.toString());
  }
}

module.exports.storeUserPosition = (id,data) => {
  try {
    var obj = objectCache.get(id);
    if ( obj != undefined ){
      obj.lat = data.latitudeI/1e7;
      obj.lon = data.longitudeI/1e7;
      obj.alt = data.altitude;
      obj.battery = (data.hasOwnProperty("batteryLevel")) ? data.batteryLevel : null;
      obj.lastHeard = new Date(Date.now());
    } else {
      obj = {
        "id": null,
        "longName": null,
        "shortName": null,
        "hwModel": null,
        "lat": data.latitudeI/1e7,
        "lon": data.longitudeI/1e7,
        "alt": data.altitude,
        "battery": data.batteryLevel,
        "lastHeard": new Date(Date.now())
      }
    }
    success = objectCache.set(id, obj);
  } catch (e) {
    console.error('error', e, data.toString());
  }
}

module.exports.storeNodeInfo = (id,data) => {
  try {
    obj = {
      "id": data.user.id,
      "longName": data.user.longName,
      "shortName": data.user.shortName,
      "hwModel": data.user.hwModel,
      "lat": data.position.latitudeI/1e7,
      "lon": data.position.longitudeI/1e7,
      "alt": data.position.altitude,
      "battery": (data.position.hasOwnProperty("batteryLevel")) ? data.position.batteryLevel : null,
      "lastHeard": new Date(data.lastHeard*1000),
    }
    success = objectCache.set(id, obj);
  } catch (e) {
    console.error('error', e, data.toString());
  }
}

module.exports.getAll = () => {
  var devices = [];
  list = objectCache.keys();
  cache = objectCache.mget(list);
  for (const [id, data] of Object.entries(cache)) {
    devices.push([id, data]);
  }
  return devices;
}
