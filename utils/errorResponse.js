class ErrorResponse extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.isAuth = false;
        this.isAdmin = false;

    }
}

module.exports = ErrorResponse;