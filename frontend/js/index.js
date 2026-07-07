const loginBtn = document.getElementById("loginBtn");

const token = localStorage.getItem("token");

if (token) {

    loginBtn.textContent = "Dashboard";

    loginBtn.addEventListener("click", () => {

        window.location.href = "dashboard.html";

    });

} else {

    loginBtn.addEventListener("click", () => {

        window.location.href = "login.html";

    });

}

const joinBtn = document.getElementById("joinBtn");

joinBtn.addEventListener("click", () => {

    const token = localStorage.getItem("token");

    if (token) {

        window.location.href = "dashboard.html";

    } else {

        window.location.href = "signup.html";

    }

});

const profilesContainer =
    document.getElementById("profilesContainer");

async function loadProfiles() {

    try {

        const response = await fetch(
            "http://localhost:5002/api/profile/all"
        );

        const profiles = await response.json();

        profilesContainer.innerHTML = "";

        profiles.forEach(profile => {

            profilesContainer.innerHTML += `
            <div class="profile-card">

            <h3>${profile.name}</h3>

            <p>${profile.profileType}</p>

            <p>📍 ${profile.city}</p>

            <button class="view-btn">
              View Profile
            </button>

          </div>
       `;

        });

    } catch (error) {
        console.log(error);
    }
}

loadProfiles();