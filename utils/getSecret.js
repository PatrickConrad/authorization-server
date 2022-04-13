const crypto = require("crypto");

const getRandomSecret = (num) => {
    let random;
    if(num == undefined) {
        random = crypto.randomBytes(32).toString('hex')
    }
    else{
        random = crypto.randomBytes(num).toString('hex')
    }
    return random;
}

module.exports = getRandomSecret