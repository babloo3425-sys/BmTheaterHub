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

                    email: "noreply@bmtheaterhub.com"

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

        const status =
            error.response?.status || "unknown";

        const brevoMessage =
            error.response?.data?.message ||
            "Email service request failed.";

        console.error(
            "Brevo Email Error:",
            {
                status,
                message: brevoMessage
            }
        );

        throw error;

    }

}

module.exports = sendEmail;