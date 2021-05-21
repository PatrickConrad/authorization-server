const jwt = require('jsonwebtoken');
const ErrorResponse = require("../utils/errorResponse");
const { getRedis } = require('./redis');

const accessSecret = process.env.ACCESS_TOKEN_SECRET 
const refreshSecret = process.env.REFRESH_TOKEN_SECRET
const emailSecret = process.env.EMAIL_TOKEN_SECRET
const phoneSecret = process.env.PHONE_TOKEN_SECRET
const forgotIdSecret = process.env.FORGOT_ID_TOKEN_SECRET 
const resetPasswordSecret = process.env.RESET_PASSWORD_TOKEN_SECRET
const organizationSecret = process.env.ORGANIZATION_TOKEN_SECRET
const originTokenSecret = process.env.ORIGIN_TOKEN_SECRET

const accessExp = parseInt(process.env.ACCESS_TOKEN_EXPIRES)
const refreshExp = parseInt(process.env.REFRESH_TOKEN_EXPIRES)
const emailExp = parseInt(process.env.EMAIL_TOKEN_EXPIRES)
const phoneExp = parseInt(process.env.PHONE_TOKEN_EXPIRES)
const forgotExp = parseInt(process.env.FORGOT_TOKEN_EXPIRES)
const resetExp = parseInt(process.env.RESET_TOKEN_EXPIRES)
const organizationExp = parseInt(process.env.ORGANIZATION_TOKEN_EXPIRES)
const originExp = parseInt(process.env.ORIGIN_TOKEN_EXPIRES)

const getInfo = (type) => {
    switch(type){
        case "access":
            return {secret: accessSecret, expires: accessExp, expireDate: new Date(Date.now() + accessExp) };
        case "refresh":
            return {secret: refreshSecret, expires: refreshExp, expireDate: new Date(Date.now() + refreshExp) };
        case "email":
            return {secret: emailSecret, expires: emailExp, expireDate: new Date(Date.now() + emailExp) };
        case "phone": 
            return {secret: phoneSecret, expires: phoneExp, expireDate: new Date(Date.now() + phoneExp) };
        case "forgotId":
            return {secret: forgotIdSecret, expires: forgotExp, expireDate: new Date(Date.now() + forgotExp) };
        case "resetPW":
            return {secret: resetPasswordSecret, expires: resetExp, expireDate: new Date(Date.now() + resetExp) };
        case "organization":
            return {secret: organizationSecret, expires: organizationExp, expireDate: new Date(Date.now() + organizationExp) };
        case "origin":
            return {secret: originSecret, expires: originExp, expireDate: new Date(Date.now() + originExp) };    
        default:
            return  null
    }
}

const sign = async (data, type) => {
    try{
        const info= getInfo(type);
        const {expireDate, secret, expires} = info;
        const id = data.id
        const iss = data.host
        const payload = {
            id,
            expires,
            expireDate,
            iss
        }
        const options = {
            expiresIn: expires
        }
        const token = await jwt.sign(payload, secret, options);
        return token;
    }
    catch(err){
       return null;
    }
}

const verify = async (token, type) => {
    const info = getInfo(type);
    const {secret} = info;
    const payload = await jwt.verify(token, secret)
    if(!payload) return null;
    if(type === "refresh"){
        const redis = getRedis(token, payload.data)
        if(!redis) return null;
    }
    return payload       
}

const expired = (data) => {
    const date = new Date().getTime()
    const expDate = new Date(data.expireDate).getTime()
    if(expDate < date){
        console.log("expired")
        return true
    }
    return false
}

const jwts = {
    sign,
    verify,
    expired
}

module.exports = jwts;