const models = require("../models");
const ErrorResponse = require("../utils/errorResponse");
const helpers = require("../helpers");

const getUsers = async (req, res, next) => {
    try{
        if(!req.user || !req.admin) return next(new ErrorResponse("Must be admin!", 401));
        const allUsers = await models.User.find();
        if(!allUsers) return next(new ErrorResponse("Not found", 500))
        res.status(201).json({
            success: true,
            users: allUsers
        })
    }
    catch(error){
        next(error)
    }
}

const addUser = async(req, res, next) => {
    try{
        if(!req.user || !req.admin) return next(new ErrorResponse("Must be admin!", 401)); 
        const {firstName, lastName, email, username, password, isAdmin, roles, darkMode, phoneNumber} = req.body;
        if(!firstName, !lastName, !email, !username, !password){
            return next(new ErrorResponse('Please enter all required information!', 400));
        }
        const exists = await models.User.findOne({username}) || await models.User.findOne({email})
        if(exists) return next(new ErrorResponse("Username or email already in use.", 400));
        const hashPassword = await helpers.bcrypt.hashPassword(password);
        const user = new models.User({
            username,
            email,
            password: hashPassword,
            firstName,
            lastName,
            isAdmin: isAdmin?isAdmin:false,
            roles: roles?roles:["user"],
            darkMode: darkMode?darkMode:false,
            phoneNumber: phoneNumber?phoneNumber:null,
        })
        const verificationToken = await helpers.jwt.sign({id: user._id, host: req.hostname}, "email");    
        if(!verificationToken) return next(new ErrorResponse("Error verifying email", 500));
        console.log("Host name", req.hostname)
        const link =  `http://localhost:3000/verify-account/${verificationToken}`
        // const isSent = await sendMessage('email', email, "verify", link);
        // if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
        user.verificationToken = verificationToken;
        console.log("vToken", verificationToken)
        await user.save();
        res.status(200).json({
            status: true
        })
    }
    catch(err){
        next(err);
    }
}

const updateUser = async(req, res, next) => {
    try{
        if(!req.user || !req.admin) return next(new ErrorResponse("Must be admin!", 401)); 
        const {id} = req.params;
        if(!id) return next(new ErrorResponse("Could not update: missing information", 400))
        const {phoneNumber, phoneCarrier, darkMode, username, email, password, firstName, lastName, isAdmin, roles} = req.body;
        const user = await models.User.findById(id).select("+password").select("+verificationToken").select("+phonePin");
        if(!user) return next(new ErrorResponse("User not found", 500))
        const dm = !darkMode ? user.darkMode : darkMode;
        const un = !username ? user.username : username;
        const fN = !firstName ? user.firstName : firstName;
        const lN = !lastName ? user.lastName : lastName;
        const iA = !isAdmin ? user.isAdmin : isAdmin;
        const rls = !roles ? user.roles : roles;
        const phone = phoneNumber ? phoneNumber : user.phoneNumber ? user.phoneNumber : null;
        const phoneCarr = phoneCarrier ? phoneCarrier : user.phoneCarrier ? user.phoneNumber : null;       
        let pass = user.password;
        if(password){
            const hashPassword = await helpers.bcrypt.hashPassword(password);
            pass = hashPassword;
        }
        if(email){
            const exists = await models.User.findOne({email});
            if(exists && `${exists._id}` !== `${user._id}`) return next(new ErrorResponse("Email already exists", 402));
            await helpers.email.sendVerifyEmail(user, req, res, next);
        }
        let pinToken = ''
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
        user.darkMode = dm;
        user.firstName = fN;
        user.lastName = lN;
        user.password = pass;
        user.isAdmin = iA;
        user.roles = rls;
        await user.save();
        res.status(201).json({
            user: {username: un, email: user.email, firstName: fN, lastName: lN, darkMode: dm, phoneNumber: user.phoneNumber, phoneCarrier: user.phoneCarrier, token: pinToken},
            success: true
        })
    }
    catch(err){
        next(err)
    }
}

const getUser = async (req, res, next) =>{
    try{
        if(!req.user || !req.admin) return next(new ErrorResponse("Must be an admin", 401));
        const {id} = req.params;
        const user = await models.User.findById(id);
        if(!user) return next(new ErrorResponse("No user found", 400))
        res.status(200).json({
            success: true,
            user
        })

    }
    catch(err){
        next(err)
    }
}

const deleteUser = async (req, res, next) =>{
    try{
        if(!req.user || !req.admin) return next(new ErrorResponse("Must be a admin", 401));
        const {id} = req.params;
        const user = await models.User.findByIdAndDelete(id);
        if(!user) return next(new ErrorResponse("No user deleted", 400))
        res.status(200).json({
            success: true
        })

    }
    catch(err){
        next(err)
    }
}

const admin = {
    addUser,
    getUsers,
    updateUser,
    getUser,
    deleteUser
}

module.exports = admin