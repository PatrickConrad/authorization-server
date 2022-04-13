const secondaryAuthRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

secondaryAuthRouter.put('/verify-email/:token', controllers.secondaryAuth.verifyEmail);
secondaryAuthRouter.put('/verify-phone/:token', middleware.auth.hasAccess ,controllers.secondaryAuth.phonePin);
secondaryAuthRouter.put('/login-pin/:token', controllers.secondaryAuth.loginPin);
secondaryAuthRouter.put('/login-email/:token', controllers.secondaryAuth.loginEmail);
secondaryAuthRouter.put('/reset-pin/:token', controllers.secondaryAuth.resetPin);
secondaryAuthRouter.put('/request-email-update', middleware.auth.hasAccess, controllers.secondaryAuth.requestEmailVerification);
secondaryAuthRouter.put('/request-phone-update', middleware.auth.hasAccess, controllers.secondaryAuth.requestPhoneVerification);
secondaryAuthRouter.put('/request-email-update/:token', middleware.auth.hasAccess, controllers.secondaryAuth.verifyEmail);

module.exports = secondaryAuthRouter;