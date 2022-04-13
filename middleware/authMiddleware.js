const helpers = require('../helpers');
const models = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const {getType, checkType} = require('../utils/typeChecker');

const hasRefresh = async(req, res, next) => {
    try{
        const refreshToken = await helpers.cookies.cookieExtractor(req, "refresh");
        if(!refreshToken) return next(new ErrorResponse("Access Denied", 401));
        const refreshData = await helpers.jwt.verify(refreshToken, "refresh");
        const expired = await helpers.jwt.expired(refreshData)
        if(expired){
            await res.clearCookie('refresh');
            await res.clearCookie('access');
            await helpers.redis.logoutRedis(req.token);       
            return next(new ErrorResponse("Access Denied: Expired", 401))
        }

        getType(refreshData)

        req.user = refreshData.id;
        req.token = refreshToken
        req.isLoggedIn = true;        
        next()
    }
    catch(err){
        next(err)
    }
}

const hasAccess = async(req, res, next) => {
    try{
        console.log("REQUEST: ", req.cookies)
        const accessToken = await helpers.cookies.cookieExtractor(req, "access");
        console.log("ACCESSTOKEN", accessToken)
        if(!accessToken){
            return next(new ErrorResponse("Access Denied", 401));
        }
        const accessData = await helpers.jwt.verify(accessToken, "access");
        const expired = await helpers.jwt.expired(accessData)
        if(expired){
            await res.clearCookie('access');
            return next(new ErrorResponse("Access Denied: Expired", 401))  
        }
        req.user = accessData.id


        next()
    }
    catch(err){
        next(err)
    }
}

const isLoggedIn = async(req, res, next) => {
    try{
    const refreshToken = await helpers.cookies.cookieExtractor(req, "refresh");
        if(!refreshToken){
            req.isLoggedIn = false;
            return next()
        }
        req.isLoggedIn = true
        return next(new ErrorResponse('Already logged in', 400));
    }
    catch(err){
        console.log(err.message)
        next(err)
    }
}

const isAdmin = async(req, res, next) => {
    try{
        const user = await models.User.findById(req.user);
        if(!user) return next(new ErrorResponse("Can't find user", 401))
        if(!user.isAdmin){
            req.admin = false;
            return next();
        }
        req.admin = true;
        next();
    }
    catch(err){
        req.admin = false
        next(err)
    }
}

const auth = {
    isLoggedIn,
    isAdmin,
    hasRefresh,
    hasAccess
}

module.exports = auth;