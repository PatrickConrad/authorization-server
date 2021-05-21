const jwts = require('./jwts');
const bcrypts = require('./bcrypt');
const redis = require('./redis');
const cookies = require('./cookies');
const email = require('./email');

const helpers = {
    jwt: jwts,
    bcrypt: bcrypts,
    redis,
    cookies,
    email
}

module.exports = helpers;