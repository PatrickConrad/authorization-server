const carrierRouter = require('express').Router();
const controllers = require('../controllers');
const middleware = require('../middleware');

carrierRouter.get('/get/:id', middleware.auth.hasAccess, controllers.carriers.getCarrier);
carrierRouter.get('/all', middleware.auth.hasAccess, controllers.carriers.getCarriers);
carrierRouter.post('/add', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.carriers.addCarrier);
carrierRouter.put('/update/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.carriers.updateCarrier);
carrierRouter.delete('/remove/:id', middleware.auth.hasAccess, middleware.auth.isAdmin, controllers.carriers.deleteCarrier);

module.exports = carrierRouter;