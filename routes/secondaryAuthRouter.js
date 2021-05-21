const secondaryAuthRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

secondaryAuthRouter.put('/verify-email/:token', controllers.secondaryAuth.verifyEmail);
secondaryAuthRouter.put('/verify-phone/:token', middleware.auth.hasAccess ,controllers.secondaryAuth.phonePin);
secondaryAuthRouter.put('/login-pin/:token', controllers.secondaryAuth.loginPin);
secondaryAuthRouter.put('/reset-pin/:token', controllers.secondaryAuth.resetPin);

module.exports = secondaryAuthRouter;