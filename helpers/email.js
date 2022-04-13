const helpers = require('./index');
const jwt = require('./jwts');
const bcrypt = require('./bcrypt');
const models = require('../models');
const ErrorResponse = require('../utils/errorResponse');

//Send verify email
const sendVerifyEmail = async(user, req, res, next) => {
    try{
        const {email} = req.body;
        if(email === user.email){
            if(user.emailVerified) return;
        };
        const verificationToken = await jwt.sign({id: req.user, host: req.hostname}, "email");    
        if(!verificationToken) return next(new ErrorResponse("Error verifying email", 500));
        console.log("Host name", req.hostname)
        const link =  `http://localhost:3000/verify-account/${verificationToken}`
        // const isSent = await sendMessage('email', email, "verify", link);
        // if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
        user.verificationToken = verificationToken
        console.log("token", verificationToken)
        user.email = email;
        user.emailVerified = false;
    }
    catch(error){
        next(error)
    }
}

//Send verify phone
const sendVerifyPhone = async(user, req, res, next) => {
    try{
        const {phoneNumber, phoneCarrier, type} = req.body;
        if(phoneNumber === user.phoneNumber && phoneCarrier === user.phoneCarrier){
            if(user.phoneVerified) return;
            console.log("resend info")
        };
        if(phoneNumber === user.phoneNumber && !phoneCarrier){
            if(user.phoneVerified) return;
            console.log("resend info")
        } 
        const t = type ? type : 'sms'
        const carrExists = await models.Carrier.findOne({carrierName: phoneCarrier, carrierType: t}) || await models.Carrier.findOne({carrierName: phoneCarrier});
        if(!carrExists || !carrExists.carrierEmail) return next(new ErrorResponse("Carrier does not exist. Please send a update request for your carrier be added!", 400));
        const pEmail = carrExists.carrierEmail;
        console.log("phoneEmail:", pEmail)
        user.phoneNumber = phoneNumber;
        user.phoneCarrierEmail = pEmail;
        const getPin = Math.floor(100000 + Math.random() * 900000);
        const pin = `${getPin}`;
        console.log("pin: " + pin);
        const hashedPin = await bcrypt.hashPassword(pin);
        const pinToken = await jwt.sign({id:req.user, host: req.hostname}, "phone");
        const combinedEmail = user.phoneNumber + user.phoneCarrierEmail;
        // const isSent = await sendMessage('phone', combinedEmail, 'verify', pin);
        console.log("success: phone")
        user.phonePin = hashedPin;
        user.phoneVerified = false;
        return pinToken
    }
    catch(error){
        next(error)
    }
}

const email = {
    sendVerifyEmail,
    sendVerifyPhone
}

module.exports = email