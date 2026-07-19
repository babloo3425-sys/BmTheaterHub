const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: "smtp-relay.brevo.com",

    port: 587,

    secure: false,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    },

    requireTLS: true,

    connectionTimeout: 30000,

    greetingTimeout: 30000,

    socketTimeout: 30000

});

module.exports = transporter;