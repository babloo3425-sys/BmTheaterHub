const sendResetBtn =
document.getElementById("sendResetBtn");

sendResetBtn.addEventListener(

    "click",

    sendResetLink

);

async function sendResetLink(){

    const email =
    document.getElementById("email").value.trim();

    if(!email){

        showToast(
            "Please enter your email.",
            "error"
        );

        return;

    }

    try{

        const response = await fetch(

            "http://localhost:5002/api/auth/forgot-password",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    email

                })

            }

        );

        const data =
        await response.json();

        if(!response.ok){

            throw new Error(
                data.message
            );

        }

        showToast(

            "Reset link request sent successfully.",

            "success"

        );

        console.log(data);

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

}