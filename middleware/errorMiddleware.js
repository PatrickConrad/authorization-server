const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = {...err};
    error.message = err.message;

    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            msg: error.message || "Server Error",
            custom: error.custom || 'There was a problem', 
            status: error.statusCode || 500
        }
    })
}

module.exports = errorHandler;