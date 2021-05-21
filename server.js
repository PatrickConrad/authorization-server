require('dotenv').config({path: __dirname + '/config/config.env'});
const port = process.env.PORT
const express = require('express');
const morgan = require('morgan');
const connectDb = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const corsSetup = require('./config/cors');
const router = require('./routes');


connectDb();

const app = express();

if(process.env.NODE_ENV === 'development') app.use(morgan('dev'))

if(process.env.NODE_ENV === 'development') app.enable('trust proxy');

app.use((req, res, next) =>{
    corsSetup(req, res, next);
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST");
    next();
  });

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.use('/api/v1', router);

app.listen(port, (err)=>{
    if(err){
        console.log("Error starting express server")
        return console.log(err.message)
    }
    const isDevMode =  process.env.NODE_ENV==='development'?` on port: ${process.env.PORT}`: ''
    console.log(`Express server is now running`+ isDevMode +'!' )
})
