const jwts = require('./jwts'); 
const redis = require('./redis');
const cookies = require('./cookies');
const bcrypt = require('./bcrypt');
const phone = require('./phone');

const loginUser = async (user) => {
    if(!user.twoPointAuth){
        user.failedLogins = 0;
        await user.save();
        const {_id} = user;
        const aType = "access"
        const rType = "refresh"
        const refToken = await jwts.sign({id: _id, host: req.hostname, ip: req.ip}, rType)
        const accToken = await jwts.sign({id: _id, host: req.hostname}, aType);
        await redis.setRedis(_id, refToken)
        res.cookie(
            rType,
            refToken,
            cookies.setOptions(rType)
        )
        res.cookie(
            aType,
            accToken,
            cookies.setOptions(aType)
        )
        res.cookie(
            "hasCredentials", 
            "true",
            cookies.setOptions("hasCredentials")
        )
        console.log("l", _id)
        return res.redirect('http://localhost:3000/vboms/authorized').status(201).json({
            user: {id: user._id, firstName: user.firstName, lastName: user.lastName, username: user.username, roles: user.roles, email: user.email, phoneNumber: user.phoneNumber?? '', phoneEmail: user.phoneCarrierEmail?? '', contactPreference: user.contactPreference?? 'email', phoneVerified: user.phoneVerified?? false},
            isAuth: true,
            isAdmin: user.isAdmin,
            success: true
        })
    }
    if(user.twoPointPreference === 'email' || !user.phoneNumber){
        const emailToken = await jwts.sign({id: user._id}, 'email');
        if(!emailToken) return next(new ErrorResponse("Error signing", 500));
        console.log("EmailToken: ",emailToken);
        const link =  `http://localhost:3000/vboms/auth/twoPoint/${emailToken}`
        // const isSent = await sendMessage('email', req.body.email, "twoPoint", link);
        // if(!isSent) return next(new ErrorResponse("Verification Email not sent", 500));
        user.verificationToken = emailToken;
        await user.save();
        console.log(link)
        return res.status(200).json({
            success: true,
            twoPointAuth: true,
            type: 'email'
        })
    }
    const getPin = phone.getPin();
    const pin = `${getPin}`;
    const hashedPin = await bcrypt.hashPassword(pin);
    const pinToken = await jwts.sign({id: user._id, host: req.hostname}, "phone");
    user.phonePin = hashedPin;
    console.log("pin", pin)
    const combinedEmail = user.phoneNumber + user.phoneCarrierEmail;
    await user.save();
    const isSent = await sendMessage("phone", combinedEmail, "verify", pin);

    return res.status(201).json({
        success: true,
        token: pinToken,
        twoPointAuth: true,
        type: 'phone'
    })
}

module.exports = loginUser;