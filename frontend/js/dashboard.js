const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

async function loadProfile() {

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

        document.getElementById("name").textContent =
            profile.name;

        document.getElementById("profileType").textContent =
            "🎭 " + profile.profileType;

        document.getElementById("city").textContent =
            "📍 " + profile.city;

        document.getElementById("whatsapp").textContent =
        "📞 " + profile.whatsapp; 
            
        document.getElementById("about").textContent =
            profile.about;

        document.getElementById("profileImage").src =
        profile.profileImage
        ? profile.profileImage
        : "images/default-avatar.png";                               

    } catch (error) {

        console.log(error);

        alert("Failed to load profile");
    }
}

loadProfile();

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");

        window.location.href =
            "login.html";
    });

    const changePhotoBtn = document.getElementById("changePhotoBtn");

    const profileImageInput = document.getElementById("profileImageInput");

    changePhotoBtn.addEventListener("click", () => {

    profileImageInput.click();

});

profileImageInput.addEventListener("change", uploadProfilePhoto);

async function uploadProfilePhoto() {

    const file = profileImageInput.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("profileImage", file);

    try {

        const response = await fetch("http://localhost:5002/api/upload/profile-photo", {

            method: "POST",

            headers: {

                Authorization: "Bearer " + localStorage.getItem("token")

            },

            body: formData

        });

        const data = await response.json();

         console.log(data);

         if(!response.ok){

         throw new Error(data.message);

       }

        alert(data.message);

        loadProfile();

    }

    catch(error){

    console.error(error);

    alert(error.message);

}

}

    document
    .getElementById("editProfileBtn")
    .addEventListener("click", () => {

        window.location.href = "create-profile.html?edit=true";

    });

    document
    .getElementById("viewProfileBtn")
    .addEventListener("click", () => {

        window.location.href = "profile.html";

    });