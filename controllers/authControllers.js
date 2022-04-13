const axios = require('axios');
const ErrorResponse = require("../utils/errorResponse");
const helpers = require('../helpers');
const models = require('../models');
const sendMessage = require("../utils/sendgrid");

const organizationAuth = async (req, res, next) => {
    try {
        console.log("orgAuthRequest", req.body)
        const {type, u, org} = req.body;
        if(!type || !user || !org){
            return next(new ErrorResponse('Please enter all required information', 400))
        }
        const {identifier, password} = u;
        const user = await models.User.findOne({username: identifier}).select("+password") || await models.User.findOne({email: identifier}) || await models.User.findOne({phoneNumber: identifier});
        if(!user){
            return next(new ErrorResponse("Invalid Credentials", 401))
        }
        const hashedPassword = await user.password;
        const match = await helpers.bcrypt.comparePasswords(password, hashedPassword);
        if(!match){
            user.failedLogins = user.failedLogins + 1;
            await user.save();
            if(user.failedLogins >= 6) return next(new ErrorResponse("Too many attempts", 401));
            return next(new ErrorResponse("Invalid credentials", 401));
        }
        if(!user.isVerified) return next(new ErrorResponse("Please verify your account email", 401));
        const orgExists = await models.Organization.findOne({_id: org.id})
        if(!orgExists) return next(new ErrorResponse("Organization not found"));
        const orgVerified = await helpers.jwts.verify(org.token, 'organization', orgExists.authServices.organizationSecret);
        if(!orgVerified){
            return next(new ErrorResponse("Organization not valid", 401))
        }
        if(!user.phoneVerified || !user.twoPointAuth){
            const {_id} = user;
            if(type === 'register'){
                const userRefToken = await helpers.jwts.sign( {org: orgExists, userInfo: {firstName: user.firstName, lastName: user.lastName, vbomsId: user._id, email: user.email, contactPreference: user.contactPreference ?? 'email', phoneNumber: user.phoneNumber?? '', phoneCarrier: user.phoneCarrier?? '', phoneCarrierEmail: user.phoneCarrierEmail?? ''}}, "userRef");
                if(!userRefToken){
                    return next(new ErrorResponse("Error signing credentials", 500))
                }
                const originResponse = async ()=>{
                    const data = await axios.post(`${orgExists.authServices.authUrl}`, {token: userRefToken}, {withCredentials: true}) 
                    if(!data || !data.success){
                        return next(new ErrorResponse("Error creating user on service"))
                    }
                    return data
                }
                await originResponse()
                orgExists.users.push(_id)
                return res.status(201).json({
                    success: true,
                    message: `New ${orgExists.name} user created`
                })
            }
            const userRefToken = await helpers.jwts.sign( {id: user._id, org: orgExists}, "userRef");
            if(!userRefToken){
                return next(new ErrorResponse("Error signing credentials", 500))
            }
            return res.redirect([201], `${org.redirectUrl}?vbomsToken=${userRefToken}`)
        }
        res.status(200).json({
            success: true,
            message: 'Must set up verification phone'
        })
        
    }
    catch(err){
        console.log("Org Auth error: ", err.message)
        return next(new ErrorResponse(`${err.message}`, 500))
    }
}

const register = async(req, res, next) => {
    try{
        console.log(req.body)
        const {firstName, lastName, email, username, password} = req.body;
        if(!firstName, !lastName, !email, !username, !password){
            return next(new ErrorResponse('Please enter all required information!', 400));
        }
        console.log('testing', req.body)
        const exists = await models.User.findOne({username}) || await models.User.findOne({email})
        if(exists) return next(new ErrorResponse("Username or email already in use.", 400));
        const hashPassword = await helpers.bcrypt.hashPassword(password);
        const user = new models.User({
            username,
            email,
            unverifiedEmail: email,
            password: hashPassword,
            firstName,
            lastName
        })
        const verificationToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, "email");    
        if(!verificationToken) return next(new ErrorResponse("Error verifying email", 500));
        console.log("Host name", req.hostname)
        const link =  `http://localhost:3000/vboms/auth/verify/email/${verificationToken}`
        const isSent = await sendMessage('email', email, "verify", link);
        if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
        user.verificationToken = verificationToken;
        console.log("vToken", verificationToken)
        await user.save();
        console.log(user._id)
        res.status(200).json({
            status: true,
            id: user._id 
        })
    }
    catch(err){
        console.log(res.err)
        next(err);
    }
}

const login = async(req, res, next) => {
    try{
        const {identifier, password} = req.body;
        const user = await models.User.findOne({username: identifier}).select("+password") || await models.User.findOne({email: identifier}).select("+password") || await models.User.findOne({phoneNumber: identifier}).select("+password");
        if(!user){
            return next(new ErrorResponse("Invalid Credentials", 401))
        }
        console.log("req body: ", user)
        const hashedPassword = await user.password;
        const match = await helpers.bcrypt.comparePasswords(password, hashedPassword);
        if(!match){
            user.failedLogins = user.failedLogins + 1;
            await user.save();
            if(user.failedLogins >= 6) return next(new ErrorResponse("Too many attempts", 401));
            return next(new ErrorResponse("Invalid credentials", 401));
        }
        if(!user.isVerified) return next(new ErrorResponse("Please verify your account", 401));
        if(!user.twoPointAuth){
            const {_id} = user;
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
            console.log("l", _id)
            return res.status(201).json({
                user: {id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, roles: user.roles, email: user.email, phoneNumber: user.phoneNumber?? '', phoneEmail: user.phoneCarrierEmail?? '', contactPreference: user.contactPreference?? 'email', phoneVerified: user.phoneVerified?? false},
                isAuth: true,
                isAdmin: user.isAdmin,
                success: true
            })
        }
        if(user.twoPointPreference === 'email' || !user.phoneNumber){
            const emailToken = await helpers.jwt.sign({id: user._id}, 'email');
            if(!emailToken) return next(new ErrorResponse("Error signing", 500));
            console.log("EmailToken: ",emailToken);
            const link =  `http://localhost:3000/vboms/auth/twoPoint/${emailToken}`
            // const isSent = await sendMessage('email', req.body.email, "twoPoint", link);
            // if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
            user.verificationToken = emailToken;
            await user.save();
            console.log(link)
            return res.status(200).json({
                success: true,
                twoPointAuth: true,
                type: 'email'
            })
        }
        const getPin = helpers.phone.getPin();
        const pin = `${getPin}`;
        const hashedPin = await helpers.bcrypt.hashPassword(pin);
        const pinToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, "phone");
        user.phonePin = hashedPin;
        console.log("pin", pin)
        const combinedEmail = user.phoneNumber + user.phoneCarrierEmail;
        await user.save();
        const isSent = await sendMessage("phone", combinedEmail, "verify", pin);
    
        return res.status(201).json({
            success: true,
            token: pinToken,
            twoPointAuth: true,
            type: 'phone'
        })
    }
    catch(err){
        next(err)
    }
}

const logout = async(req, res, next) => {
    try{
        await res.clearCookie('refresh');
        await res.clearCookie('access');
        await res.clearCookie('hasCredentials');
        await helpers.redis.logoutRedis(req.token);
        res.status(200).json({
            success: true
        })
    }
    catch(err){
        console.log(err.message)
        next(err)
    }
}

const updateRefresh = async(req, res, next) => {
    try{
        const newRefreshToken = await helpers.jwt.sign({id: req.user, host: req.hostname}, "refresh");
        const newAccessToken = await helpers.jwt.sign({id: req.user, host: req.hostname}, "access");
        if(!newRefreshToken || !newAccessToken) return next(new ErrorResponse("Invalid Credentials", 401));
        const redis = await helpers.redis.setRedis(req.user, newRefreshToken);
        const removeOld = await helpers.redis.logoutRedis(req.token);
        const id = req.user;
        const currentUser = await models.User.findById(id);
        if(!currentUser) return next(new ErrorResponse("Invalid Credentials", 401))     
        res.cookie(
            "refresh", 
            newRefreshToken,
            helpers.cookies.setOptions("refresh")
        )
        res.cookie(
            "access", 
            newAccessToken,
            helpers.cookies.setOptions("access")
        )
        res.cookie(
            "hasCredentials", 
            "true",
            helpers.cookies.setOptions("hasCredentials")
        )
        console.log("currID", currentUser._id)
        res.status(200).json({
            success: true,
            user: {id: currentUser._id, username: currentUser.username, roles: currentUser.roles},
            isAuth: true,
            isAdmin: currentUser.isAdmin
        })
    }
    catch(err){
        res.status(400).json({
            error: err.message,
            status: false
        })
    }
}

const updateAccess = async(req, res, next) => {
    try{
        const newAccessToken = await helpers.jwt.sign({id: req.user, host: req.hostname}, "access");
        if(!newAccessToken) return next(new ErrorResponse("Invalid Credentials", 401));
        const id = req.user;
        const currentUser = await models.User.findById(id)
        if(!currentUser) return next(new ErrorResponse("Invalid Credentials", 401)) 
        res.cookie(
            "access", 
            newAccessToken,
            helpers.cookies.setOptions("access")
        )
        res.cookie(
            "hasCredentials", 
            "true",
            helpers.cookies.setOptions("hasCredentials")
        )
        console.log("currID", currentUser._id)
        res.status(200).json({
            success: true,
            user: {id: currentUser._id, firstName: currentUser.firstName, lastName: currentUser.lastName, username: currentUser.username, roles: currentUser.roles, email: currentUser.email, phoneNumber: currentUser.phoneNumber?? '', phoneEmail: currentUser.phoneCarrierEmail?? ''},
            isAuth: true,
            isAdmin: currentUser.isAdmin
        })     
    }
    catch(error){
        next(error)
    }
}

const forgotPassword = async(req, res, next) => {
    try{
        if(req.isLoggedIn) return next(new ErrorResponse("Alrady logged in", 400))
        const {identifier, contactPreference} = req.body;
        const user = await models.User.findOne({username: identifier}) || await models.User.findOne({email: identifier}) || await models.User.findOne({phoneNumber: identifier});
        if(!user) return next(new ErrorResponse("User not found", 404));
        const contactType = !contactPreference ? user.contactPreference : contactPreference;
        if(contactType === 'email' || !user.phoneVerified){
            console.log("resetId", user._id)
            console.log("host", req.hostname)
            const resetToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, "resetPW");
            console.log("resetTok", resetToken)
            user.resetToken = resetToken;
            await user.save();
            console.log("hostname", req.hostname)
            const link = `http://localhost:3000/vboms/auth/reset/${resetToken}`;
            await sendMessage('email', user.email, "reset", link);
            return res.status(200).json({
                success: true,
                user: {username: user.username, token: resetToken, contactPreference: contactType}
            })
        }
        const getPin = Math.floor(10000+Math.random()*900000);
        const pin = `${getPin}`;
        const hashedPin = await helpers.bcrypt.hashPassword(pin);
        const pinToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, "phone");
        user.phonePin = hashedPin;
        await user.save();
        const combinedEmail = user.phoneNumber + user.phoneCarrierEmail;
        await sendMessage('phone', combinedEmail, 'reset', pin);
        console.log("Reset Pin: " + pin)
        res.status(200).json({
            success: true,
            user: { contactPreference: contactType, token: pinToken, username: user.username}
        })
    }
    catch(err){
        next(err);
    }
}

const resetPassword = async(req, res, next) => {
    try{
        const {token} = req.params;
        console.log("token", token)
        const {password} = req.body;
        if(!token || !password) return next(new ErrorResponse("Failed to reset: missing information", 401));
        const info = await helpers.jwt.verify(token, "resetPW");
        if(!info) return next(new ErrorResponse("Failed to reset: no info"));
        const expired = helpers.jwt.expired(info);
        if(expired) return next(new ErrorResponse("Failed to reset: access expired!", 404));
        const user = await models.User.findById(info.id).select("+password").select('+resetToken');
        console.log(user)
        if(!user || !user.resetToken || user.resetToken === '') return next(new ErrorResponse("Server error: user not found", 500));
        if(user.resetToken !== token) return next(new ErrorResponse("Failed to reset: invalid information", 401));
        const hashPassword = await helpers.bcrypt.hashPassword(password);
        user.password = hashPassword;
        user.resetToken = '';
        await user.save();
        return res.status(201).json({
            success: true
        })
    }
    catch(error){
        next(error)
    }
}

const auth = {
    updateAccess,
    updateRefresh,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
}

module.exports = auth