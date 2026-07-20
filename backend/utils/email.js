const axios = require("axios");

async function sendEmail({
    to,
    subject,
    html
}) {

    try {

        const response = await axios.post(

            "https://api.brevo.com/v3/smtp/email",

            {

                sender: {

                    name: "BMTheaterHub",

                    email: "bblkumar8@gmail.com"

                },

                to: [

                    {

                        email: to

                    }

                ],

                subject,

                htmlContent: html

            },

            {

                headers: {

                    accept: "application/json",

                    "content-type": "application/json",

                    "api-key": process.env.BREVO_API_KEY

                }

            }

        );

        return response.data;

    }

    catch (error) {

        console.error(

            "BREVO API ERROR:",

            error.response?.data || error.message

        );

        throw error;

    }

}

module.exports = sendEmail;