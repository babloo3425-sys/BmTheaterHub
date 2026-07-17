/* =====================================================
   BMTheaterHub
   Admin Dashboard
   ===================================================== */

const token = localStorage.getItem("token");

/* =========================================
   Admin Authentication
========================================= */

async function checkAdminAccess(){

    if(!token){

        window.location.href = "login.html";

        return false;

    }

    try{

        const response = await fetch(

            "http://localhost:5002/api/profile/me",

            {

                headers:{

                    Authorization:`Bearer ${token}`

                }

            }

        );

        if(!response.ok){

            window.location.href = "login.html";

            return false;

        }

        const profile = await response.json();

        if(profile.role !== "admin"){

            alert("Access Denied.");

            window.location.href = "login.html";

            return false;

        }

        return true;

    }

    catch(error){

        console.error(error);

        window.location.href = "login.html";

        return false;

    }

}

async function loadDashboard() {

    try {

        const response = await fetch(
            "http://localhost:5002/api/admin/dashboard",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        document.getElementById("totalUsers").textContent =
            `👥 Users : ${data.statistics.totalUsers}`;

        document.getElementById("totalArtists").textContent =
            `🎭 Artists : ${data.statistics.totalArtists}`;

        document.getElementById("featuredArtists").textContent =
            `⭐ Featured : ${data.statistics.featuredArtists}`;

        document.getElementById("verifiedArtists").textContent =
            `✅ Verified : ${data.statistics.verifiedArtists}`;

        document.getElementById("blockedArtists").textContent =
            `🚫 Blocked : ${data.statistics.blockedArtists}`;

    }

    catch (error) {

        console.error(error);

        alert("Unable to load dashboard.");

    }

}

(async()=>{

    const allowed = await checkAdminAccess();

    if(!allowed){

        return;

    }

    loadDashboard();

})();

      /* =====================================================
   Load All Artists
===================================================== */

async function loadArtists() {

    try {

        const response = await fetch(
        
        "http://localhost:5002/api/admin/artists",
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

        const data = await response.json();

        const tableBody =
            document.getElementById("artistTableBody");

        tableBody.innerHTML = "";

        data.artists.forEach(profile => {

           tableBody.innerHTML += `

<tr>

<td>
<img src="${profile.profileImage}" alt="Artist">
</td>

<td>${profile.name}</td>

<td>${profile.profileType}</td>

<td>
<span class="status ${profile.verified ? "status-verified" : "status-normal"}">
${profile.verified ? "Verified" : "No"}
</span>
</td>

<td>
<span class="status ${profile.featured ? "status-featured" : "status-normal"}">
${profile.featured ? "Featured" : "No"}
</span>
</td>

<td>
<span class="status ${profile.blocked ? "status-blocked" : "status-normal"}">
${profile.blocked ? "Blocked" : "No"}
</span>
</td>

<td>

<div class="action-buttons">

<button
class="view-btn"
onclick="viewArtist('${profile._id}')">
👁 View
</button>

<button
class="verify-btn ${profile.verified ? "active-btn" : ""}"
onclick="verifyArtist('${profile._id}')">
✅ Verify
</button>

<button
class="feature-btn ${profile.featured ? "active-btn" : ""}"
onclick="featureArtist('${profile._id}')">
⭐ Feature
</button>

<button
class="block-btn ${profile.blocked ? "active-btn" : ""}"
onclick="blockArtist('${profile._id}')">
🚫 Block
</button>

<button
class="deactivate-btn ${!profile.active ? "active-btn" : ""}"
onclick="deactivateArtist('${profile._id}')">

${profile.active ? "⏸ Deactivate" : "▶ Activate"}

</button>

</div>

</td>

</tr>

`;

        });

    }

    catch (error) {

        console.error(error);

    }

}

(async()=>{

    const allowed = await checkAdminAccess();

    if(!allowed){

        return;

    }

    loadDashboard();

    loadArtists();

})();
/* =====================================================
   Verify Artist
===================================================== */

async function verifyArtist(profileId){

    try{

        const response = await fetch(

            `http://localhost:5002/api/admin/verify/${profileId}`,

            {

                method:"PATCH",

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data = await response.json();

    
        if(data.success){

            loadDashboard();

            loadArtists();

        }


    }

    catch(error){

        console.error(error);

    }

}

/* =========================================
   Feature Artist
========================================= */

async function featureArtist(profileId){

    try{

        const response = await fetch(

            `http://localhost:5002/api/admin/feature/${profileId}`,

            {

                method:"PATCH",

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data = await response.json();

        if(data.success){

            loadDashboard();

            loadArtists();

        }

    }

    catch(error){

        console.error(error);

    }

}

/* =========================================
   Block / Unblock Artist
========================================= */

async function blockArtist(profileId){

    try{

        const response = await fetch(

            `http://localhost:5002/api/admin/block/${profileId}`,

            {

                method:"PATCH",

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data = await response.json();

        if(data.success){

            loadDashboard();

            loadArtists();

        }

    }

    catch(error){

        console.error(error);

    }

}

/* =========================================
   Live Search
========================================= */

const searchArtist =
    document.getElementById("searchArtist");

searchArtist.addEventListener("keyup", () => {

    const keyword =
        searchArtist.value.toLowerCase();

    const rows =
        document.querySelectorAll(
            "#artistTableBody tr"
        );

    rows.forEach(row => {

        const text =
            row.innerText.toLowerCase();

        row.style.display =
            text.includes(keyword)
            ? ""
            : "none";

    });

});

/* =========================================
   Refresh Dashboard
========================================= */

document
.getElementById("refreshDashboardBtn")
.addEventListener("click", () => {

    loadDashboard();

    loadArtists();

});

/* =========================================
   View Artist Profile
========================================= */

function viewArtist(profileId){

    window.open(
        `profile.html?id=${profileId}`,
        "_blank"
    );

}

/* =========================================
   Deactivate / Activate Artist
========================================= */

async function deactivateArtist(profileId){

    console.log("Deactivate ID:", profileId);

    try{

        const response = await fetch(

            `http://localhost:5002/api/admin/deactivate/${profileId}`,

            {

                method:"PATCH",

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data = await response.json();

        console.log("Deactivate Response:", data);

        if(data.success){

            loadDashboard();

            loadArtists();

        }

    }

    catch(error){

        console.error("Deactivate Error:", error);

    }

}