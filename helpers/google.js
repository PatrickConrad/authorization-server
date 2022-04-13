const axios = require("axios");

const getGoogleTokens = async ({code})=> {
    try{
        const url = 'https://oauth2.googleapis.com/token';
        const values = {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_CLIENT_REDIRECT,
            grant_type: "authorization_code"
        }

        const qs = new URLSearchParams(values)
        const res = await axios.post(url, qs.toString(), {
            headers: {
                'Content-Type': `application/x-www-form-urlencoded`,
            }
        })
        if(!res){
            return console.log("No response from google")
        }

        return res.data
    }
    catch(err){
        console.log("Failed to fetch tokens: ", err.message)
        return err
    }
}

const getGoogleUser = async ({access_token, id_token}) => {
    try{
        const res = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
           {
               headers: {
                   Authorization: `Bearer ${id_token}`
               }
           }
        )

        if(!res){
            return console.log("error no response from server");
        }

        console.log("response from google user: ", res.data);
        return res.data
        
    }
    catch(err){
        console.log("Error: ", err.message)
    }
}

const google = {
    getGoogleTokens,
    getGoogleUser
}

module.exports =  google