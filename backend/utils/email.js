const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);

const transporter = nodemailer.createTransport({

    host: "smtp-relay.brevo.com",

    port: 465,
    
    secure: true,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    },

    requireTLS: true,

    connectionTimeout: 30000,

    greetingTimeout: 30000,

    socketTimeout: 30000

});

transporter.verify(function (error, success) {

    if (error) {

        console.error("SMTP VERIFY ERROR:", error);

    } else {

        console.log("SMTP Server is ready.");

    }

});

module.exports = transporter;