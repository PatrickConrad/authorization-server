const models = require("../models");
const ErrorResponse = require("../utils/errorResponse");

const login = async (req, res, next) =>{
    res.render('login')
    
    // try{
    //     if(!req.user) return next(new ErrorResponse("Must be logged in", 401));
    //     const {id} = req.params;
    //     const carrier = await models.Carrier.findById(id);
    //     if(!carrier) return next(new ErrorResponse("No carrier found", 400))
    //     res.status(200).json({
    //         success: true,
    //         carrier
    //     })

    // }
    // catch(err){
    //     next(err)
    // }
}

const register = async (req, res, next) =>{
    res.render('register')
    
    // try{
    //     if(!req.user) return next(new ErrorResponse("Must be logged in", 401));
    //     const {id} = req.params;
    //     const carrier = await models.Carrier.findById(id);
    //     if(!carrier) return next(new ErrorResponse("No carrier found", 400))
    //     res.status(200).json({
    //         success: true,
    //         carrier
    //     })

    // }
    // catch(err){
    //     next(err)
    // }
}

const authPage = {
    login,
    register,
    
}

module.exports = authPage