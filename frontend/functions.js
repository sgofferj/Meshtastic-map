const ms = require('milsymbol');

module.exports.newMarker = (uid, feature) => {
  SIDC ="IFSPSC------"
  callsign = (feature.longName != null) ? feature.longName : uid;
  staffComments = "Short name: ";
  staffComments += (feature.shortName != null) ? feature.shortName : "unknown";
  additionalInformation = "Battery: ";
  additionalInformation += (feature.battery != null) ? feature.battery +"%" : "unknown";
  lat = feature.lat;
  lon = feature.lon;
  if (lat != null) {
    loc = ((lat > 0) ? "N" : "S") + lat;
    loc += ", ";
    loc += ((lon > 0) ? "E" : "W") + lon;
  } else loc = "unknown";
  altm = parseInt(feature.alt);
  altft = Math.round(altm * 3.28084);
  dtg = feature.lastHeard;
  var mysymbol = new ms.Symbol(
    SIDC, {
      uniqueDesignation: callsign,
      type: altm+"m",
      staffComments: staffComments,
      additionalInformation: additionalInformation,
      dtg: dtg,
      location: loc
    }, {
      infoBackground: "white",
      infoColor: "black"
    })


  mysymbol = mysymbol.setOptions({
    size: 25
  });

  var myicon = L.icon({
    iconUrl: mysymbol.toDataURL(),
    iconAnchor: [mysymbol.getAnchor().x, mysymbol.getAnchor().y],
  });

  return L.marker([lat, lon], {
    icon: myicon,
    draggable: false
  });
}
