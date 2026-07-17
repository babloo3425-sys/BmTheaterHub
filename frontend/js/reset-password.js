const resetPasswordBtn =
document.getElementById("resetPasswordBtn");

resetPasswordBtn.addEventListener(

    "click",

    resetPassword

);

async function resetPassword(){

    const newPassword =
    document.getElementById("newPassword").value.trim();

    const confirmPassword =
    document.getElementById("confirmPassword").value.trim();

    if(!newPassword || !confirmPassword){

        showToast(
            "Please fill all fields.",
            "error"
        );

        return;

    }

    if(newPassword !== confirmPassword){

        showToast(
            "Passwords do not match.",
            "error"
        );

        return;

    }

    const token = new URLSearchParams(

        window.location.search

    ).get("token");

    try{

        const response = await fetch(

            "http://localhost:5002/api/auth/reset-password",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    token,

                    password:newPassword

                })

            }

        );

        const data = await response.json();

        if(!response.ok){

            throw new Error(data.message);

        }

        showToast(

            "Password reset successfully.",

            "success"

        );

        setTimeout(()=>{

            window.location.href =
            "login.html";

        },1500);

    }

    catch(error){

        console.error(error);

        showToast(

            error.message,

            "error"

        );

    }

}