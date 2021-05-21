const models = require("../models");
const ErrorResponse = require("../utils/errorResponse");

const getCarriers = async (req, res, next) => {
    try{
        if(!req.user) return next(new ErrorResponse("Must be logged in!", 401));
        const carriers = await models.Carrier.find();
        if(!carriers) return next(new ErrorResponse("Not found", 500))
        res.status(201).json({
            success: true,
            carriers
        })
    }
    catch(eror){
        next(error)
    }
}

const addCarrier = async (req, res, next) => {
    try{
        const {carrierName, carrierEmail, carrierType} = req.body;
        const t = carrierType ? carrierType : "sms";
        if(!req.user && !req.admin) return next(new ErrorResponse("Do not have access to modify", 401));
        const emailExists = await models.Carrier.findOne({carrierEmail: carrierEmail.toLowerCase()});
        if(emailExists && emailExists.carrierName === carierName.toLowerCase() && emailExists.carrierType === t.toLowerCase()) return next(new ErrorResponse("Carrier email and name exists!", 400))
        // const nameExists = await models.Carrier.findOne({carrierName: type});
        // if(nameExists && emailExists.carrierType === t) return next(new ErrorResponse("Carrier type already exists on this carrier", 400))
        const carrier = new models.Carrier({
            carrierName,
            carrierEmail,
            carrierType: t
        })
        await carrier.save()
        console.log(carrier)
        res.status(200).json({
            success: true,
            carrier
        })
    }
    catch(error){
        next(error);
    }
}

const updateCarrier = async (req, res, next) =>{
    try{
        if(!req.user && !req.admin) return next(new ErrorResponse("Do not have access to modify", 401));
        const {id} = req.params;
        const carrier = await models.Carrier.findById(id);
        if(!carrier) return next(new ErrorResponse("No carrier found", 400))
        const {name, email, type} = req.body;
        const cn = name ? name : carrier.carrierName;
        const e = email ? email : carrier.carrierEmail;
        const t = type ? type : carrier.carrierType;
        const nameExists = await models.Carrier.findOne({carrierName: cn.toLowerCase()});
        if(nameExists && nameExists.carrierName === cn && nameExists.carrierEmail === e && nameExists.carrierType === t) return;
        carrier.carrierName = cn;
        carrier.carrierEmail = e;
        carrier.carrierType = t;
        await carrier.save()
        console.log(carrier)
        res.status(200).json({
            success: true,
            carrier
        })
    }
    catch(err){
        next(err)
    }
}

const getCarrier = async (req, res, next) =>{
    try{
        if(!req.user) return next(new ErrorResponse("Must be logged in", 401));
        const {id} = req.params;
        const carrier = await models.Carrier.findById(id);
        if(!carrier) return next(new ErrorResponse("No carrier found", 400))
        res.status(200).json({
            success: true,
            carrier
        })

    }
    catch(err){
        next(err)
    }
}

const deleteCarrier = async (req, res, next) =>{
    try{
        if(!req.user && !req.admin) return next(new ErrorResponse("Do not have access to modify", 401));
        const {id} = req.params;
        await models.Carrier.findByIdAndDelete(id);
        res.status(200).json({
            success: true
        })

    }
    catch(err){
        next(err)
    }
}

const carriers = {
    addCarrier,
    getCarriers,
    updateCarrier,
    getCarrier,
    deleteCarrier
}

module.exports = carriers