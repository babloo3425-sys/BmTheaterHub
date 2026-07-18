const artistsContainer =
    document.getElementById("artistsContainer");

function renderArtists(profiles){

    artistsContainer.innerHTML = "";

    profiles.forEach(profile => {

        artistsContainer.innerHTML += `

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

let allProfiles = [];

function loadStates(profiles){

    const stateFilter =
        document.getElementById("stateFilter");

    const states = [
        ...new Set(
            profiles.map(profile => profile.state)
        )
    ].sort();

    stateFilter.innerHTML =
        `<option value="">All States</option>`;

    states.forEach(state => {

        stateFilter.innerHTML += `

            <option value="${state}">

                ${state}

            </option>

        `;

    });

}

function applyFilters() {

    const keyword =
        document.getElementById("searchInput").value.toLowerCase();

    const category =
        document.getElementById("categoryFilter").value;

    const state =
        document.getElementById("stateFilter").value;

    const filteredProfiles = allProfiles.filter(profile => {

    const matchKeyword =

    keyword === "" ||

    profile.name.toLowerCase().includes(keyword) ||

    profile.profileType.toLowerCase().includes(keyword) ||

    profile.city.toLowerCase().includes(keyword) ||

    profile.state.toLowerCase().includes(keyword) ||

    profile.experience.toLowerCase().includes(keyword) ||

    profile.about.toLowerCase().includes(keyword);

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

    renderArtists(filteredProfiles);

}

async function loadArtists(){

    try{

        const response = await fetch(
            `${API_BASE_URL}/api/profile/all`
        );

        const data = await response.json();

        allProfiles = data.profiles;

        renderArtists(allProfiles);

        loadStates(allProfiles);
    }

    catch(error){

        console.log(error);

    }

}

loadArtists();

document.addEventListener("click", (e) => {

    if (e.target.classList.contains("view-btn")) {

        const artistId = e.target.dataset.id;

        window.location.href =
            `profile.html?id=${artistId}`;

    }

});

document
    .getElementById("searchInput")
    .addEventListener("input", applyFilters);

document
    .getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

document
    .getElementById("stateFilter")
    .addEventListener("change", applyFilters);