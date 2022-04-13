const jwts = require('./jwts');
const bcrypts = require('./bcrypt');
const redis = require('./redis');
const cookies = require('./cookies');
const email = require('./email');
const phone = require('./phone');
const google = require('./google')

const helpers = {
    jwt: jwts,
    bcrypt: bcrypts,
    redis,
    cookies,
    email,
    phone,
    google
}

module.exports = helpers;