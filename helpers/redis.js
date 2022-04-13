const client = require('../config/redis');
const ErrorResponse = require('../utils/errorResponse')

const setRedis = (id, token) => {
    return new Promise((resolve, reject)=>{

        client.set(`${token}`, `${id}`, (error, reply)=>{
            if(error) {
                console.log(error.message)
                reject(new ErrorResponse("Error with setting client", 500))
            }
            client.expire(`${token}`, parseInt(process.env.REFRESH_TOKEN_EXPIRES/1000))

            console.log('Saved to redis')

            return("add")
        })
        resolve("success")
    })
}

const getRedis = (token) => {
    return new Promise((resolve, reject)=>{
        
        client.get(`${token}`, (err, object)=>{
            if(err){
                reject(new ErrorResponse("Error with setting client", 500))
            }
        })
        resolve("found")
    })  
}

const logoutRedis = (token) => {
    return new Promise((resolve, reject)=>{
        client.del(`${token}`, (err, object)=>{
            if(err){
                reject(new ErrorResponse("Error loggoing out "))
            }
            console.log(object)
            resolve("found & removed")
        })
    })
}

const redis = {
    setRedis,
    getRedis,
    logoutRedis
}

module.exports = redis;