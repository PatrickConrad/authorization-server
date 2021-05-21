const accessExp = parseInt(process.env.ACCESS_TOKEN_EXPIRES)
const refreshExp = parseInt(process.env.REFRESH_TOKEN_EXPIRES)
const emailExp = parseInt(process.env.EMAIL_TOKEN_EXPIRES)
const phoneExp = parseInt(process.env.PHONE_TOKEN_EXPIRES)
const forgotExp = parseInt(process.env.FORGOT_TOKEN_EXPIRES)
const resetExp = parseInt(process.env.RESET_TOKEN_EXPIRES)


const getExpDate = (type) => {
    let expDate
    switch(type){
        case "access":
            expDate = new Date(Date.now() + accessExp)
            return expDate
        case "refresh":
            expDate = new Date(Date.now() + refreshExp)
            return expDate
        case "email":
            expDate = new Date(Date.now() + emailExp)
            return expDate 
        case "phone": 
            expDate = new Date(Date.now() + phoneExp)
            return expDate
        case "forgotId":
            expDate = new Date(Date.now() + forgotExp)
            return expDate
        case "resetPW":
            expDate = new Date(Date.now() + resetExp)
            return expDate
        default:
            return  null

    }

}


module.exports = {
    getExpDate
}
