const errorHandler = require('./errorMiddleware');
const auth = require('./authMiddleware');

const middleware = {
    errorHandler,
    auth
}

module.exports = middleware;