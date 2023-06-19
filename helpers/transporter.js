const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user:'hansenchan7@gmail.com',
        pass:"nwqdgytnwztrbaug"
    },
    tls:{
        rejectUnauthorized:false
    }
})

module.exports = transporter