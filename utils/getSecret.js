const crypto = require("crypto");

const getRandomSecret = (num) => {
    const random = crypto.randomBytes(num).toString('hex')
    return random;
}

module.exports = getRandomSecret