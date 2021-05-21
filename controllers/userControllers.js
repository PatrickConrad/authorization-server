const helpers = require("../helpers");
const models = require("../models");
const ErrorResponse = require("../utils/errorResponse");

const getUser = async(req, res, next) => {
    try{
        const {id} = req.params;
        if(!id) return next(new ErrorResponse("Could not get: missing information", 400));
        if(!req.user && !req.admin) return next(new ErrorResponse("Could not get: unauthorized", 401))
        if(req.user !== id && !req.admin) return next(new ErrorResponse("Could not get: unmatched information", 401))
        const user = await models.User.findById(id)
        if(!user) return next(new ErrorResponse("Could not get: could not find user", 500))
        res.status(201).json({
            success: true,
            user: {username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, contactPreference: user.contactPreference, twoPointAuth: user.twoPointAuth, darkMode: user.darkMode, phoneNumber: user.phone},
        })
    }
    catch(err){
       next(err)
    }
}

const updateUser = async(req, res, next) => {
    try{
        const {id} = req.params;
        if(!id) return next(new ErrorResponse("Could not update: missing information", 400))
        const {phoneNumber, phoneCarrier, contactPreference, twoPointAuth, darkMode, username, email, password, firstName, lastName} = req.body;
        if(!req.user && !req.admin) return next(new ErrorResponse("Could not update: unauthorized", 401))
        if(req.user !== id && !req.admin) return next(new ErrorResponse("Could not update: unmatched information", 401))
        const user = await models.User.findById(id).select("+password").select("+verificationToken").select("+phonePin");
        if(!user) return next(new ErrorResponse("User not found", 500))
        const dm = !darkMode ? user.darkMode : darkMode;
        const un = !username ? user.username : username;
        const fN = !firstName ? user.firstName : firstName;
        const lN = !lastName ? user.lastName : lastName;
        const phone = phoneNumber ? phoneNumber : user.phoneNumber ? user.phoneNumber : null;
        const phoneCarr = phoneCarrier ? phoneCarrier : user.phoneCarrier ? user.phoneNumber : null;       
        let pass = user.password;
        if(password){
            const hashPassword = await helpers.bcrypt.hashPassword(password);
            pass = hashPassword;
        }
        if(contactPreference === 'email' && !user.emailVerified) return next(new ErrorResponse("Please verify email", 400));
        if(email){
            const exists = await models.User.findOne({email});
            if(exists && `${exists._id}` !== `${user._id}`) return next(new ErrorResponse("Email already exists", 402));
            await helpers.email.sendVerifyEmail(user, req, res, next);
        }
        if(twoPointAuth && !user.phoneVerified) return next(new ErrorResponse("Please verify phone for two point security", 400));
        if(contactPreference === 'phone' && !user.phoneVerified) return next(new ErrorResponse("Please verify phone for two point security", 400));
        let pinToken = ''
        let twoPoint = twoPointAuth ? twoPointAuth : user.twoPointAuth
        let contactPref = contactPreference ? contactPreference : user.contactPreference
        if(phoneNumber || phoneCarrier){
            if(phoneNumber){
                const exists = await models.User.findOne({phoneNumber})
                if(exists && `${exists._id}`!== `${user._id}`) return next(new ErrorResponse("Phone already exists", 402));
            }
            pinToken = await helpers.email.sendVerifyPhone(user, req, res, next);
            twoPoint = false;
            contactPref = "email"
        }
        user.username = un;
        user.contactPreference = contactPref;
        user.twoPointAuth = twoPoint;
        user.darkMode = dm;
        user.firstName = fN;
        user.lastName = lN;
        user.password = pass;
        await user.save();
        res.status(201).json({
            user: {username: un, email: user.email, firstName: fN, lastName: lN, contactPreference: contactPref, twoPointAuth: twoPoint, darkMode: dm, phoneNumber: user.phoneNumber, phoneCarrier: user.phoneCarrier, token: pinToken},
            success: true
        })
    }
    catch(err){
        next(err)
    }
}

const deleteUser = async(req, res, next) => {
    try{
        const {id} = req.params;
        if(!id) return next(new ErrorResponse("Could not delete: missing information", 400));
        if(!req.user && !req.admin) return next(new ErrorResponse("Could not delete: unauthorized", 401))
        if(req.user !== id && !req.admin) return next(new ErrorResponse("Could not delete: unmatched information", 401))
        await models.User.findByIdAndDelete(id)
        res.status(201).json({
            success: true,
            user: {}
        })
    }
    catch(err){
       next(err)
    }
}

const user = {
    getUser,
    updateUser,
    deleteUser
}

module.exports = user;