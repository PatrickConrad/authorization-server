const authRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

// authRouter.get('/', controllers.auth.checkAuth);
authRouter.post('/login', middleware.auth.isLoggedIn, controllers.auth.login);
authRouter.post('/register', middleware.auth.isLoggedIn, controllers.auth.register);
authRouter.put('/forgot-password', middleware.auth.isLoggedIn, controllers.auth.forgotPassword);
authRouter.put('/reset-password/:token', controllers.auth.resetPassword);
authRouter.put('/update-access', controllers.auth.updateAccess);
authRouter.post('/update-refresh', controllers.auth.updateRefresh);
authRouter.delete('/logout', controllers.auth.logout);


module.exports = authRouter;