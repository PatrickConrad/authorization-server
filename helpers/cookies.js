const {getExpDate} = require('../utils/dates');

const cookieExtractor = (req, type) => {
    let token;
    if(req && req.cookies){
        token = req.cookies[type]
    }
    return token
}

const setOptions = async(type) => {
    try{
        if(!type){
            return null
        }
        const envSetting = process.env.NODE_ENV === 'production' ? true : false;
        let options = {
            expires: "",
            secure: envSetting,
            httpOnly: envSetting,
            sameSite: envSetting,
        }
        const expDate = await getExpDate(type);
        if(!expDate){
            return null
        }
        options.expires = expDate
        return options
    }
    catch(error){
        return null
    }
}

const cookies = {
    cookieExtractor,
    setOptions
}

module.exports = cookies