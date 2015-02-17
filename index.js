// cache pre-existing global values
var globals = ["qrvis", "vg", "d3"],
    globalValues = {};

globals.forEach(function(g) {
    if (g in global) globalValues[g] = global[g];
});

// ensure availability of d3 and topojson in global namespace
// NOTE: will "pollute" namespace with jsdom window, etc
vg = require("vega");
d3 = require("d3");
topojson = require("topojson");
require("d3-geo-projection")(d3);

// load and export vega
require("./qrvis");
module.exports = qrvis;

// restore pre-existing global values
globals.forEach(function(g) {
    if (g in globalValues) global[g] = globalValues[g];
    else delete global[g];
});