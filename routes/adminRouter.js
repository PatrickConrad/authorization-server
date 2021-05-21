const adminRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

adminRouter.get('/user/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.admin.getUser);
adminRouter.get('/users', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.admin.getUsers);
adminRouter.post('/user/add', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.admin.addUser);
adminRouter.put('/user/update/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.admin.updateUser);
adminRouter.delete('/user/delete/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.admin.deleteUser);

module.exports = adminRouter;