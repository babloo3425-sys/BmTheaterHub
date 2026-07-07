const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}

const createBtn =
    document.getElementById("createBtn");

createBtn.addEventListener("click", createProfile);

async function createProfile() {

    const name =
        document.getElementById("name").value.trim();

    const profileType =
        document.getElementById("profileType").value;

    const city =
        document.getElementById("city").value.trim();

    const state =
        document.getElementById("state").value.trim();

    const experience =
        document.getElementById("experience").value.trim();

    const about =
        document.getElementById("about").value.trim();

    const whatsapp =
        document.getElementById("whatsapp").value.trim();

    if (
        !name ||
        !profileType ||
        !city ||
        !state ||
        !experience ||
        !about ||
        !whatsapp
    ) {

        alert("Please fill all fields");

        return;

    }

    try {

        const response = await fetch(
            "http://localhost:5002/api/profile/create",
            {
                method: "POST",

                headers: {

                    "Content-Type":"application/json",

                    Authorization: token

                },

                body: JSON.stringify({

                    name,
                    profileType,
                    city,
                    state,
                    experience,
                    about,
                    whatsapp

                })

            }
        );

        const data = await response.json();

        if(!response.ok){

            alert(data.message);

            return;

        }

        alert("Profile Created Successfully");

        window.location.href =
            "dashboard.html";

    }

    catch(error){

        console.log(error);

        alert("Server Error");

    }

}