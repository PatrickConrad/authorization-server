const models = require('../models');
const getRandomSecret = require('../utils/getSecret');

const createOrganizationAccount = async (req, req, next) => {
    try{
        const { name, type } = req.body;
        if(!name || !type || !req.user) {
            return res.status(400).json({
                success: false,
                message: 'Please include all information'
            })
        }
        const userSecret = getRandomSecret();
        const organizationSecret = getRandomSecret();
        const org = new models.Organization({
            name,
            type,
            creatorId: req.user,
            authServices: {
                userSecret,
                organizationSecret,
                authUrl: req.body.authUrl?? '',
                userSecretExp: req.body.secretExp?? 300000
            }
        })

        await org.save();

        console.log("org", org)
        return res.status(201).json({
            success: true
        })
    }

    catch(err){
        console.log(err.message)
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


module.exports = {

}