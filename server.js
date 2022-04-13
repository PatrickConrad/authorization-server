require('dotenv').config({path: __dirname + '/config/config.env'});
const port = process.env.PORT
const express = require('express');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const connectDb = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const corsSetup = require('./config/cors');
const router = require('./routes');
const https = require('https');


connectDb();

const app = express();

if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))

if(process.env.NODE_ENV === 'development') app.enable('trust proxy');

app.use((req, res, next) =>{
    corsSetup(req, res, next);
});

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:7000");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,");
//     res.header("Access-Control-Allow-Credentials", true);
//     res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST");
//     next();
//   });


// app.use((req, res, next)=>{
//     console.log("IP",  req.ip, req._remoteAddress, req.socket.remoteAddress)
//     next()
// })

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

// app.use((req, res, next)=>{
//     req.WAN = ''
//     const callback = function(err, ip){
//         if(err){
//             return console.log(err);
//         }
//         console.log('Our public IP is', ip);
//         if(!req.WAN || ip !== req.WAN) return req.WAN = ip
//     };

//     const checkWAN = async () => {
//         await https.get({
//         host: 'api.ipify.org',
//         }, (response) =>{
//             let ip ='';
//             response.on('data', function(d) {
//                 ip = d.toString();
//             });
//             response.on('end', function() {
//                 if(ip){
//                     callback(null, ip);
//                 } else {
//                     callback('could not get public ip address :(');
//                 }
//             });
//         });
//     }
//     checkWAN()
//     console.log("WAN", req.WAN)


//     next()
// })

//enable template engine
app.engine('hbs', exphbs.engine({
    defaultLayout: 'auth',
    extname: '.hbs'
}))

app.set('view engine', 'hbs');
app.set('views', './views');

app.get('/', (req, res, next)=>{
    res.send("Welcome to my api")
})
app.use('/api/v1', router);

app.listen(port, (err)=>{
    if(err){
        console.log("Error starting express server")
        return console.log(err.message)
    }
    const isDevMode =  process.env.NODE_ENV==='development'?` on port: ${process.env.PORT}`: ''
    console.log(`Express server is now running`+ isDevMode +'!' )
})
