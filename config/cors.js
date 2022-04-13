const cors = require('cors');


const corsSetup = async (req, res, next) => {
   
    try{
        const origin = req.headers.origin;

        console.log("origin", req.headers.origin)
        if(!origin){
            cors({credentials: true, origin: false})
            return next()
        }    
        // const originExists = await Origin.findOne({url: origin});
    
        const origins = ['http://localhost:3050', 'http://localhost:7011', 'http://localhost:7015', 'http://localhost:7012','http://localhost:7000', 'http://localhost:3000', 'http://localhost: 5001', 'http://localhost: 5001'];
        const originExists = origins.filter(o => { return (o===origin || o===`http://${origin}` || o===`https://${origin}`)});
        console.log(originExists[0])
        if(!originExists) return cors({credentials: true, origin: false});

        cors({credentials: true})
        res.header("Access-Control-Allow-Origin", `${originExists[0]}`);
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST");

       next()
    }
    catch(err){
        console.log("Error: ", err.message)
        next(err)
    }


}


// cors({
//     origin: "domain",
//     credentials: true, //allows credentials
//     methods: ["GET", "POST"],
// })


module.exports = corsSetup