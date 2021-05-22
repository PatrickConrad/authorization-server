const redis = require('redis');
const Promise = require("bluebird");

Promise.promisifyAll(redis);

const client = redis.createClient(process.env.REDIS_URL);

client.on('connect', ()=> {
    console.log("Client conected to redis")
})

client.on('ready', ()=> {
    console.log("Client conected to redis & ready to use")
})

client.on("error", (err)=>{
    console.log(err.message)
})

client.on("end", ()=>{
    console.log("Client disconnected from redis");
})

process.on('SIGINT', ()=>{
    client.quit()
})

module.exports = client
