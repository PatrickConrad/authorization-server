const helpers = require('../helpers');
const models = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const sendMessage = require("../utils/sendgrid");

const requestPhoneVerification = async (req, res, next) => {
    try {
        if(!req.user) return next(new ErrorResponse("Failed to verify user access", 401));
        const userExists = await models.User.findById(req.user);
        if(!userExists) return next(new ErrorResponse("No user exists", 402));
        if(!req.body.phoneInfo) return next(new ErrorResponse("Must include phone", 400))
        const phoneTaken = await models.User.findOne({phoneNumber: req.body.phoneInfo.phoneNumber});
        console.log(phoneTaken)
        if(phoneTaken && `${phoneTaken._id}` !== `${req.user}`) return next(new ErrorResponse("Phone number already in use", 401));
        userExists.unverifiedPhone = req.body.phoneInfo.phoneNumber + req.body.phoneInfo.phoneEmail;
        await userExists.save()
        const phoneToken = await helpers.jwt.sign({id: req.user}, 'phone');
        if(!phoneToken) return next(new ErrorResponse("Error signing", 500));
        console.log("PhoneToken: ",phoneToken);
        console.log("Host name", req.hostname)
        const pin = helpers.phone.getPin()
        console.log("pin", pin)
        const hashedPin = await helpers.bcrypt.hashPassword(`${pin}`);
        const pinToken = await helpers.jwt.sign({id: req.user, host: req.hostname}, "phone");
        userExists.phonePin = hashedPin;
        console.log("pin", pin)
        await userExists.save();
        // const isSent = await sendMessage("phone", combinedEmail, "verify", pin);
        res.status(201).json({
            success: true,
            token: pinToken,
        })
    }
    catch(err){
        next(err);
    }
}

const requestEmailVerification = async (req, res, next) => {
    try {
        console.log("body", req.body)
        if(!req.user) return next(new ErrorResponse("Failed to verify user access", 401));
        const userExists = await models.User.findById(req.user).select("+verificationToken");
        if(!userExists) return next(new ErrorResponse("No user exists", 402));
        if(!req.body.email) return next(new ErrorResponse("Must include email", 400))
        const emailTaken = await models.User.findOne({email: req.body.email});
        if(emailTaken && `${emailTaken._id}` !== `${req.user}`) return next(new ErrorResponse("Email already in use", 401));
        userExists.unverifiedEmail = req.body.email;
        await userExists.save()
        const emailToken = await helpers.jwt.sign({id: req.user}, 'email');
        if(!emailToken) return next(new ErrorResponse("Error signing", 500));
        console.log("EmailToken: ",emailToken);
        console.log("Host name", req.hostname)
        const link =  `http://localhost:3000/vboms/auth/verify/email/${emailToken}`
        const isSent = await sendMessage('email', req.body.email, "verify", link);
        if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
        userExists.verificationToken = emailToken;
        console.log("vToken", emailToken)
        await userExists.save();
        console.log(userExists)
        console.log(link)
        res.status(200).json({
            success: true,
        })
    }
    catch(err){
        next(err);
    }
}

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
        if(req.user && req.user !== info.id) return next(new ErrorResponse("Failed to verify: users do not match"), 401)
        const user = await models.User.findById(info.id).select("+verificationToken");
        if(!user) return next(new ErrorResponse("Not found", 404));
        if(token !== user.verificationToken) return next(new ErrorResponse("Failed to verify: not a match!", 404));        
        console.log("USER INFO: before: ", user)
        user.isVerified = true;
        user.emailVerified = true;
        user.verificationToken = "";
        user.email = user.unverifiedEmail;
        user.unverifiedEmail = ''
        await user.save();
        console.log("USER INFO:", user)
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
        const phoneInfo = async()=>{
            const index = user.unverifiedPhone.indexOf('@');
            const data = {
                phone: user.unverifiedPhone.slice(0, index),
                email: user.unverifiedPhone.slice(index, user.unverifiedPhone.length)
            }
            console.log("DATAAAA: ", data);
            const carrierInfo = await models.Carrier.findOne({carrierEmail: data.email})
            if(!carrierInfo) return next(new ErrorResponse("Failed to find carrier info", 500));
            return {
                phoneNumber: data.phone,
                carrierEmail: carrierInfo.carrierEmail,
                carrierName: carrierInfo.carrierName
            }
        }
        const userPhone = await phoneInfo();
        console.log("userPhone", userPhone)
        user.phoneNumber = userPhone.phoneNumber;
        user.phoneCarrier = userPhone.carrierName;
        user.phoneCarrierEmail = userPhone.carrierEmail;
        user.phonePin = '';
        user.unverifiedPhone = '';
        await user.save();
        return res.status(200).json({
            success: true,
        })
    }
    catch(error){
        next(error)
    }
}


const loginEmail = async (req, res, next) => {
    try{
        const {token} = req.params;
        if(!token) return next (new ErrorResponse("Failed to verify: missing info", 400))
        const info = await helpers.jwt.verify(token, "email");
        if(!info) return next(new ErrorResponse("Failed to login: info not verified", 400));
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to login: access expired"))
        
        console.log("INFOOOOO: ", info)
        const user = await models.User.findById(info.id).select('+verificationToken');
        console.log("USERRRRRRRR: ", user)
        if(!user || !user.verificationToken || user.verificationToken === '' || `${token}` !== `${user.verificationToken}`) return next(new ErrorResponse("Server Error: info not verified", 500))
        user.verificationToken = "";
        await user.save()
        const {_id} = user
        const aType = "access"
        const rType = "refresh"
        const refToken = await helpers.jwt.sign({id: _id, host: req.hostname, ip: req.ip}, rType)
        const accToken = await helpers.jwt.sign({id: _id, host: req.hostname}, aType);
        await helpers.redis.setRedis(_id, refToken)
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
        res.cookie(
            "hasCredentials", 
            "true",
            helpers.cookies.setOptions("hasCredentials")
        )
        res.status(200).json({
            success: true,
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, roles: user.roles, email: user.email, phoneNumber: user.phoneNumber?? '', phoneEmail: user.phoneCarrierEmail?? '', contactPreference: user.contactPreference, phoneVerified: true},
            isAuth: true,
            isAdmin: user.isAdmin
        })

    }
    catch(err){
        next(err)
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
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to verify login: access expired", 401))
        const user = await models.User.findById(info.id).select('+phonePin');
        if(!user || !user.phonePin || user.phonePin === '') return next(new ErrorResponse("Server error: user not found", 500));
        const hashedPin = user.phonePin;
        const match = await helpers.bcrypt.comparePasswords(pin, hashedPin);
        if(!match) return next(new ErrorResponse("Failed to verify login: invalid credentials", 401));
        user.phoneVerified = true;
        user.phonePin = '';
        user.failedLogins = 0;
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
        res.cookie(
            "hasCredentials", 
            "true",
            helpers.cookies.setOptions("hasCredentials")
        )
        console.log("cookies", res.cookie)
        return res.status(201).json({
            success: true,
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, roles: user.roles, email: user.email, phoneNumber: user.phoneNumber?? '', phoneEmail: user.phoneCarrierEmail?? '', contactPreference: user.contactPreference, phoneVerified: true},
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
    loginEmail,
    phonePin,
    resetPin,
    requestPhoneVerification,
    requestEmailVerification
}

module.exports = secondaryAuth;