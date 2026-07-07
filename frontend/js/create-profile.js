const isEditMode =
    new URLSearchParams(window.location.search)
        .get("edit") === "true";

const token = localStorage.getItem("token");

if (!token) {

    window.location.href = "login.html";

}

const createBtn =
    document.getElementById("createBtn");

createBtn.addEventListener("click", createProfile);

async function loadProfileForEdit() {

    if (!isEditMode) return;

    try {

        const response = await fetch(
            "http://localhost:5002/api/profile/me",
            {
                headers: {
                    Authorization: token
                }
            }
        );

        const profile = await response.json();

        document.getElementById("name").value =
            profile.name || "";

        document.getElementById("profileType").value =
            profile.profileType || "";

        document.getElementById("city").value =
            profile.city || "";

        document.getElementById("state").value =
            profile.state || "";

        document.getElementById("experience").value =
            profile.experience || "";

        document.getElementById("about").value =
            profile.about || "";

        document.getElementById("whatsapp").value =
            profile.whatsapp || "";

        document.getElementById("pageTitle").textContent =
          "Edit Profile";

        document.getElementById("pageSubtitle").textContent =
           "Update your theater profile";

    }

    catch (error) {

        console.log(error);

    }

}

loadProfileForEdit();

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

    const url = isEditMode
        ? "http://localhost:5002/api/profile/update"
        : "http://localhost:5002/api/profile/create";

    const response = await fetch(url, {

        method: isEditMode ? "PUT" : "POST",

        headers: {

            "Content-Type": "application/json",

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

    });

    const data = await response.json();

    if (!response.ok) {

        alert(data.message);

        return;

    }

    alert(
        isEditMode
            ? "Profile Updated Successfully"
            : "Profile Created Successfully"
    );

    window.location.href = "dashboard.html";

}

catch (error) {

    console.log(error);

    alert("Server Error");

 }

}