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
            user: {username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, contactPreference: user.contactPreference, twoPointAuth: user.twoPointAuth, darkMode: user.darkMode, phoneNumber: user.phoneNumber, phoneEmail: user.phoneCarrierEmail, phoneCarrier: user.phoneCarrier},
        })
    }
    catch(err){
       next(err)
    }
}

const getUserNoId = async(req, res, next) => {
    try{
        if(!req.user && !req.admin) return next(new ErrorResponse("Could not get: unauthorized", 401))
        const user = await models.User.findById(req.user)
        if(!user) return next(new ErrorResponse("Could not get: could not find user", 500))
        res.status(201).json({
            success: true,
            user: {username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, contactPreference: user.contactPreference, twoPointAuth: user.twoPointAuth, darkMode: user.darkMode, phoneNumber: user.phoneNumber, phoneEmail: user.phoneCarrierEmail, phoneCarrier: user.phoneCarrier, contactMethod: user.contactPreference, twoPointMethod: user.twoPointPreference},
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
        const {twoPointAuth, darkMode, username, currPassword, password, firstName, lastName, contactMethod, twoPointMethod} = req.body;
        if(!req.user && !req.admin) return next(new ErrorResponse("Could not update: unauthorized", 401))
        if(req.user !== id && !req.admin) return next(new ErrorResponse("Could not update: unmatched information", 401))
        const user = await models.User.findById(id).select("+password").select("+verificationToken").select("+phonePin");
        if(!user) return next(new ErrorResponse("User not found", 500))
        const dm = !darkMode ? user.darkMode : darkMode;
        const un = !username ? user.username : username;
        const fN = !firstName ? user.firstName : firstName;
        const lN = !lastName ? user.lastName : lastName;
        const cp = !contactMethod ? user.contactPreference : contactMethod;
        const tpp = !twoPointMethod ? user.twoPointPreference : twoPointMethod;
        const usernameTaken = await models.User.findOne({username: username});
        if(usernameTaken && `${usernameTaken._id}`!==`${user._id}`) return next(new ErrorResponse("Username taken", 400))
        if(password && !currPassword) return next(new ErrorResponse("Must verify previous password in order to change it", 400))
        let pass = user.password;
        if(password){
            const oldPassConfirmed = await helpers.bcrypt.comparePasswords(currPassword, pass);
            if(!oldPassConfirmed) return next(new ErrorResponse("The current password you entered does not match the previous", 400))
            const hashPassword = await helpers.bcrypt.hashPassword(password);
            pass = hashPassword;
        }
        if((cp === 'phone' || tpp === 'phone') && !user.phoneVerified || !user.phoneNumber || !user.phoneCarrierEmail) return next(new ErrorResponse("Please verify phone to set it to preferred contact method", 400));
        user.twoPointPreference = tpp;
        user.username = un;
        user.contactPreference = cp;
        user.twoPointAuth = twoPointAuth;
        user.darkMode = dm;
        user.firstName = fN;
        user.lastName = lN;
        user.password = pass;
        await user.save();
        res.status(201).json({
            user: {username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, twoPointAuth: user.twoPointAuth, darkMode: dm, phoneNumber: user.phoneNumber, phoneCarrier: user.phoneCarrier, twoPointMethod: tpp, contactMethod: cp},
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
    deleteUser,
    getUserNoId
}

module.exports = user;