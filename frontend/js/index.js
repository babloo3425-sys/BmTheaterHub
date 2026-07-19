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

function renderProfiles(profiles) {

    profilesContainer.innerHTML = "";

    profiles.forEach(profile => {

        console.log(profile);
 
        profilesContainer.innerHTML += `

            <div class="profile-card">

                <img
                    src="${profile.profileImage || "images/default-avatar.png"}"
                    class="artist-photo"
                    alt="${profile.name}">

                <h3>${profile.name}</h3>

                <p>🎭 ${profile.profileType}</p>

                <p>📍 ${profile.city}, ${profile.state}</p>

                <button
                    class="view-btn"
                    data-id="${profile._id}">

                    View Profile

                </button>

            </div>

        `;

    });

}

async function applyFilters() {

    const keyword = document.getElementById("searchInput").value.trim();

    const category = document.getElementById("categoryFilter").value;

    const state = document.getElementById("stateFilter").value;

    try {

        const response = await fetch(
    `${API_BASE_URL}/api/profile/all`
    );

        const data = await response.json();

        const profiles = data.profiles;

        const filteredProfiles = profiles.filter(profile => {

        const matchKeyword =

        keyword === "" ||

    profile.name.toLowerCase().includes(keyword) ||

    profile.profileType.toLowerCase().includes(keyword) ||

    profile.city.toLowerCase().includes(keyword) ||

    profile.state.toLowerCase().includes(keyword) ||

    (profile.experience || "").toLowerCase().includes(keyword) ||

    (profile.about || "").toLowerCase().includes(keyword);
 
    const matchCategory =
                category === "" ||
                profile.profileType === category;

            const matchState =
                state === "" ||
                profile.state === state;

            return matchKeyword &&
                   matchCategory &&
                   matchState;

        });

        renderProfiles(filteredProfiles);

    }

    catch(error){

        console.log(error);

    }

}

async function loadProfiles() {

    try {

        const response = await fetch(
    `${API_BASE_URL}/api/profile/all`
    );

        const data = await response.json();

        console.log(response.status);

        console.log(data);

        const profiles = data.profiles;

/* ===========================
   Featured Profiles
=========================== */

const featuredProfiles = profiles.filter(profile => {

    return profile.featured === true;

});

if (featuredProfiles.length > 0) {

    renderProfiles(featuredProfiles);

}

else {

    renderProfiles(

        profiles.slice(0, 6)

    );

}

    } catch (error) {
        console.log(error);
    }
}

loadProfiles();

/* ===========================
   Filters
=========================== */

const categoryFilter =
    document.getElementById("categoryFilter");

const stateFilter =
    document.getElementById("stateFilter");

const searchInput =
    document.getElementById("searchInput");

/* ===========================
   Category Cards
=========================== */

const categoryCards =
    document.querySelectorAll(".category-card");

categoryCards.forEach(card => {

    card.addEventListener("click", () => {

        categoryFilter.value =
            card.dataset.category;

        applyFilters();

    });

});

/* ===========================
   Search
=========================== */

   searchInput.addEventListener("input", applyFilters);

   searchInput.addEventListener("keyup", applyFilters);

   searchInput.addEventListener("search", applyFilters);

   searchInput.addEventListener("change", applyFilters);

/* ===========================
   Category Dropdown
=========================== */

categoryFilter.addEventListener(
    "change",
    applyFilters
);

/* ===========================
   State Dropdown
=========================== */

stateFilter.addEventListener(
    "change",
    applyFilters
);

/* ===========================
   View Profile
=========================== */

document.addEventListener("click", (e) => {

    if (e.target.classList.contains("view-btn")) {

        console.log(e.target.dataset.id);

        window.location.href =
            "profile.html?id=" + e.target.dataset.id;

    }

});

/* ===========================
   View All Artists
=========================== */

const viewAllArtistsBtn =
    document.getElementById("viewAllArtistsBtn");

viewAllArtistsBtn.addEventListener("click", () => {

    window.location.href = "artists.html";

});