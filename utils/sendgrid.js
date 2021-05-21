const sgMail = require('@sendgrid/mail');


const sendMessage = async (method, email, type, data) => {
    try{
        console.log(process.env.SENDGRID_API_KEY)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        let msg
        if(method === "email" && type === "verify"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: 'Your Website',
                from: 'patrickoconrad@gmail.com', // Change to your verified sender
                text: `Click the link to verify:  ${data}`,
            }
            console.log('message', msg)
            return await sgMail.send(msg);

        }
        if(method === "email" && type === "reset"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: 'Your Website',
                from: 'patrickoconrad@gmail.com', // Change to your verified sender
                text: `Click the link to to be redirected to the password reset page: ${data}`,
            }   
            console.log('message', msg)
            return await sgMail.send(msg);
        }
        if(method === "phone" && type === "verify"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: `Your verifcation code is: ${data} `,
                from: 'patrickoconrad@gmail.com', // Change to your verified sender
                text: ` `
            }
            console.log('message', msg)
            return await sgMail.send(msg);
        }
        else{
            msg = {
                to: `${email}`, // Change to your recipient
                subject: `Your reset verifcation code is: ${data} `,
                from: 'patrickoconrad@gmail.com', // Change to your verified sender
                text: ` `
            } 
            console.log('message', msg)
            return await sgMail.send(msg);
        }   
    }
    catch(error){
        return null

    }
}
module.exports = sendMessage;