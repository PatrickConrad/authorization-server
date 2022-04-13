const jwts = require('./jwts');
const bcrypts = require('./bcrypt');
const redis = require('./redis');
const cookies = require('./cookies');
const email = require('./email');
const phone = require('./phone');

const helpers = {
    jwt: jwts,
    bcrypt: bcrypts,
    redis,
    cookies,
    email,
    phone
}

module.exports = helpers;