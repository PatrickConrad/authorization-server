const helpers = require('../helpers');
const models = require('../models');
const ErrorResponse = require('../utils/errorResponse');

//verify Email
const verifyEmail = async (req, res, next) => {
    try {
        const {token} = req.params;
        console.log("token", token)
        if(!token || token === "") return next(new ErrorResponse("Failed to verify: no token included", 401));
        const info = await helpers.jwt.verify(token, "email");
        if(!info) return next(new ErrorResponse("Failed to verify: no info"));
        console.log("infosec auth", info)
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Not verified!", 404));
        if(req.user && req.user !== id) return next(new ErrorResponse("Failed to verify: users do not match"), 401)
        const user = await models.User.findById(info.id).select("+verificationToken");
        if(!user) return next(new ErrorResponse("Not found", 404));
        if(token !== user.verificationToken) return next(new ErrorResponse("Failed to verify: not a match!", 404));        
        user.isVerified = true;
        user.emailVerified = true;
        user.verificationToken = "";
        await user.save();
        return res.status(201).json({
            success: true
        })
    }
    catch(error){
        console.log(error.message)
        next(error)
    }
}

//Verify Phone Pin
const phonePin = async(req, res, next) => {
    try{
        const {pin} = req.body;
        const {token} =req.params;
        if(!pin || !token) return next(new ErrorResponse("Failed to verify phone: missing information", 402));
        const info = await helpers.jwt.verify(token, "phone");
        if(!info) return next(new ErrorResponse("Failed to verify phone: access expired"));
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to verify phone: access expired", 401))
        if(info.id !== req.user) return next(new ErrorResponse("Failed to verify phone: invalid credentials"));
        console.log(info.id, req.user)
        const user = await models.User.findById(req.user).select('+phonePin');
        console.log("user", user)
        if(!user || !user.phonePin || user.phonePin === '') return next(new ErrorResponse("Server error: user not found", 500));
        const hashedPin = user.phonePin;
        const match = await helpers.bcrypt.comparePasswords(pin, hashedPin);
        if(!match) return next(new ErrorResponse("Failed to verify phone: invalid credentials", 401));
        user.phoneVerified = true;
        user.phonePin = '';
        await user.save();
        return res.status(200).json({
            success: true,
        })
    }
    catch(error){
        next(error)
    }
}

    //Login Phone Pin Verify
const loginPin = async(req, res, next) => {
    try{
        const {pin} = req.body;
        const {token} =req.params;
        if(!pin || !token) return next(new ErrorResponse("Failed to verify phone: missing information", 402));
        const info = await helpers.jwt.verify(token, "phone");
        if(!info) return next(new ErrorResponse("Failed to verify login: missinger info", 500));
        if(!info) return next(new ErrorResponse("Failed to verify login: access expired"));
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to verify login: access expired", 401))
        const user = await models.User.findById(info.id).select('+phonePin');
        if(!user || !user.phonePin || user.phonePin === '') return next(new ErrorResponse("Server error: user not found", 500));
        const hashedPin = user.phonePin;
        const match = await helpers.bcrypt.comparePasswords(pin, hashedPin);
        if(!match) return next(new ErrorResponse("Failed to verify login: invalid credentials", 401));
        user.phoneVerified = true;
        user.phonePin = '';
        await user.save();
        const aType = "access";
        const rType = "refresh";
        const refToken = await helpers.jwt.sign({id: user._id, host: req.hostname, ip: req.ip}, rType);
        const accToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, aType);
        await helpers.redis.setRedis(user._id, refToken);
        res.cookie(
            rType,
            refToken,
            helpers.cookies.setOptions(rType)
        )
        res.cookie(
            aType,
            accToken,
            helpers.cookies.setOptions(aType)
        )
        return res.status(200).json({
            success: true,
            user: {username: user.username, roles: user.roles},
            isAuth: true,
            isAdmin: user.isAdmin
        })
    }
    catch(error){
        next(error)
    }
}

    //Reset Phone Pin
const resetPin = async(req, res, next) => {
    try{
        const {pin} = req.body;
        const {token} =req.params;
        if(!pin || !token) return next(new ErrorResponse("Failed to verify reset: missing information", 402));
        const info = await helpers.jwt.verify(token, "phone");
        if(!info) return next(new ErrorResponse("Failed to verify reset: access expired"));
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to verify reset: access expired", 401))
        const user = await models.User.findById(info.id).select('+phonePin');
        if(!user || !user.phonePin || user.phonePin === '') return next(new ErrorResponse("Server error: user not found", 500));
        const hashedPin = user.phonePin;
        const match = await helpers.bcrypt.comparePasswords(pin, hashedPin);
        if(!match) return next(new ErrorResponse("Failed to verify reset: invalid credentials", 401));
        user.phonePin = '';
        const resetToken = await helpers.jwt.sign({id:user._id, host: req.hostname}, "resetPW");
        user.resetToken = resetToken;
        await user.save();
        return res.status(200).json({
            success: true,
            token: resetToken
        })
    }
    catch(error){
        next(error)
    }
}


const secondaryAuth = {
    verifyEmail,
    loginPin,
    phonePin,
    resetPin
}

module.exports = secondaryAuth;