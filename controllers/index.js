const auth = require('./authControllers');
const user = require('./userControllers');
const secondaryAuth = require('./secondaryAuthControllers');
const carriers = require('./carrierControllers');
const admin = require('./adminControllers');

const controllers = {
    auth,
    user,
    secondaryAuth,
    carriers,
    admin
}

module.exports = controllers