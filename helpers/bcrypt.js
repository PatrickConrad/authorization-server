const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        return await hashedPassword
    }
    catch(err){
        console.log(`Error: ${err.message}`)
    }
}

const comparePasswords = async (password, hashPassword) => {
    try{
        const isMatch = await bcrypt.compare(password, hashPassword);
        if(!isMatch){
            // console.log('Passwords do not match');
            return false
        }
        else{
            return true
        }
    }
    catch(err){
        console.log(`Error: ${err.message}`)
    }
}

const bcrypts =  {
    comparePasswords,
    hashPassword
}

module.exports = bcrypts