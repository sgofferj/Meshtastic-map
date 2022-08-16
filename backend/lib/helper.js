const os = require('os')

module.exports.failExit = (msg) => {
  console.log(msg);
  process.exit(1);
}
