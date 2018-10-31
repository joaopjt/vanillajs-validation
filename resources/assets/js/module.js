const validator = require('./index').default;

// Browser Global
window.vanillaValidator = validator;

// Module
module.exports = validator;
