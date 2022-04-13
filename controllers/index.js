const auth = require('./authControllers');
const user = require('./userControllers');
const secondaryAuth = require('./secondaryAuthControllers');
const carriers = require('./carrierControllers');
const admin = require('./adminControllers');
const authPage = require('./authPageControllers');

const controllers = {
    auth,
    user,
    secondaryAuth,
    carriers,
    admin,
    authPage
}

module.exports = controllers