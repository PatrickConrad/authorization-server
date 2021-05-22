const cors = require('cors');


const corsSetup = async (req, res, next) => {
   
    try{
        const address = req.headers['x-forwarded-host']
        const reqType = req.headers['x-forwarded-proto']
        const origin = `${reqType}://${address}`
        if(!address || !reqType){
            cors({credentials: true, origin: true})
            return next()
        }    
        // const originExists = await Origin.findOne({url: origin});
        // const origins = ['http://localhost:3050', 'http://localhost:3000', 'http://localhost: 5001', 'http://localhost: 5001'];
        // const originExists = origins.includes(origin)
        if(!originExists) return cors({credentials: true, origin: true});

        cors({credentials: true, origin: true})
       next()
    }
    catch(err){
        next(err)
    }


}



module.exports = corsSetup