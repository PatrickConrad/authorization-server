const userRouter = require('express').Router();
const controllers = require('../controllers')
const middleware = require('../middleware')

userRouter.get('/', middleware.auth.hasAccess,  middleware.auth.isAdmin, controllers.user.getUserNoId);
userRouter.get('/:id', middleware.auth.hasAccess,  middleware.auth.isAdmin, controllers.user.getUser);
userRouter.put('/:id', middleware.auth.hasAccess,  middleware.auth.isAdmin, controllers.user.updateUser);
userRouter.delete('/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.user.deleteUser);


module.exports = userRouter;