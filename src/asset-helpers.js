const path = require("path");

module.exports.readAsset = (p) => path.join(__dirname, `../assets/${p}`);
