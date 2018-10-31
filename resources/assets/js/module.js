const validator = require('./index');

// Browser Global
window.vanillaValidator = validator.default;

// Module
module.exports = validator;
