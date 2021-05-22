const mongoose = require('mongoose');

const dbOptions = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true
};

const connectDb = async() => {
    try{
        if(process.env.NODE_ENV === 'development'){
            const connectionString = `${process.env.DB_PROTOCOL}://${process.env.DB_IP}/${process.env.DB_NAME}`
            const connectDB = await mongoose.connect(connectionString, dbOptions)
            return console.log(`Node has successfully connected to ${process.env.DB_NAME} database!`)
        }
        const connectionString = `${process.env.DB_URI}`
        const connectDB = await mongoose.connect(connectionString, dbOptions)
        return console.log(`Node has successfully connected to ${process.env.DB_NAME} Atlas database!`)

    }
    catch(err){
        console.log(err.message);
        console.log(`Could not connect to ${process.env.DB_NAME}`)
    }
}

module.exports = connectDb;