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
        console.log("TYPE", type)
        if(type === 'hasCredentials'){
            let options = {
                expires: '',
                secure: true,
                httpOnly: false,
                sameSite: true
            }
            const expDate = await getExpDate("refresh");
            options.expires = expDate;
            return options
        }
        const envSetting = process.env.NODE_ENV === 'production' ? true : false;
        let options = {
            expires: "",
            secure: envSetting,
            httpOnly: type === 'refresh' ? false : true,
            sameSite: envSetting,
        }
        const expDate = await getExpDate(type);
        if(!expDate){
            return null
        }
        options.expires = expDate
        console.log("OPTIONS", options)
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