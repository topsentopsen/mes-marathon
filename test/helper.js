global.window = global; global.localStorage = { getItem: () => null, setItem: () => {} };
require('../js/data.js'); require('../js/sim.js');
module.exports = window.SC;
