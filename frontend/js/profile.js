const token = "Bearer " + localStorage.getItem("token");

async function loadPublicProfile() {

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

        document.getElementById("experience").textContent =
            "⭐ " + profile.experience;

        document.getElementById("about").textContent =
            profile.about;

        document.getElementById("profileImage").src =
            profile.profileImage ||
            "images/default-avatar.png";

        document.getElementById("whatsappBtn").href =
            "https://wa.me/91" + profile.whatsapp;

    }

    catch(error){

        console.log(error);

    }

}

loadPublicProfile();