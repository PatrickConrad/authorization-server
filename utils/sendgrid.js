const sgMail = require('@sendgrid/mail');
const siteEmail = process.env.SITE_EMAIL


const sendMessage = async (method, email, type, data) => {
    try{
        console.log(process.env.SENDGRID_API_KEY)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        let msg
        if(method === "email" && type === "twoPoint"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: 'Your Website',
                from: siteEmail, // Change to your verified sender
                text: `Click the link to verify your identity and login:  ${data}`,
            }
            console.log('message', msg)
            return await sgMail.send(msg);

        }
        if(method === "email" && type === "verify"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: 'Your Website',
                from: siteEmail, // Change to your verified sender
                text: `Click the link to verify your email:  ${data}`,
            }
            console.log('message', msg)
            return await sgMail.send(msg);

        }
        if(method === "email" && type === "reset"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: 'Your Website',
                from: siteEmail, // Change to your verified sender
                text: `Click the link to to be redirected to the password reset page: ${data}`,
            }   
            console.log('message', msg)
            return await sgMail.send(msg);
        }
        if(method === "phone" && type === "verify"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: `Your verifcation pin is: ${data} `,
                from: siteEmail, // Change to your verified sender
                text: ` `
            }
            console.log('message', msg)
            return await sgMail.send(msg);
        }
        if(method === "phone" && type === "twoPoint"){
            msg = {
                to: `${email}`, // Change to your recipient
                subject: `Your login pin is: ${data} `,
                from: siteEmail, // Change to your verified sender
                text: ` `
            }
            console.log('message', msg)
            return await sgMail.send(msg);
        }
        else{
            msg = {
                to: `${email}`, // Change to your recipient
                subject: `Your reset pin is: ${data} `,
                from: siteEmail, // Change to your verified sender
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