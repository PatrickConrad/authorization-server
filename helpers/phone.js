const getPin = () => {
    return Math.floor(100000+Math.random()*900000);
}

const phone = {
    getPin
}
module.exports = phone