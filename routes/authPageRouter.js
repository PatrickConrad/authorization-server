const authPageRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

// authPageRouter.get('/', controllers.auth.checkAuth);
authPageRouter.get('/login', controllers.authPage.login);
authPageRouter.get('/register', controllers.authPage.register);




module.exports = authPageRouter;