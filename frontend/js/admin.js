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

            `${API_BASE_URL}/api/profile/me`,

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


/* =========================================
   Dashboard
========================================= */

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/admin/dashboard`,
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


/* =====================================================
   Initial Admin Check
===================================================== */

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

            `${API_BASE_URL}/api/admin/artists`,

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

        if(!data.success || !Array.isArray(data.artists)){

            console.error(
                "Unable to load artists:",
                data
            );

            return;

        }

        data.artists.forEach(profile => {

            tableBody.innerHTML += `

<tr>

<td>
<img
src="${profile.profileImage || "images/default-avatar.png"}"
alt="Artist">
</td>

<td>${profile.name || ""}</td>

<td>${profile.profileType || ""}</td>

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

<button
class="edit-about-btn"
onclick="openEditAboutModal(
'${profile._id}',
decodeURIComponent('${encodeURIComponent(profile.name || "")}')
)">
✏️ Edit About
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


/* =====================================================
   Admin Initial Load
===================================================== */

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

            `${API_BASE_URL}/api/admin/verify/${profileId}`,

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

        else{

            alert(data.message || "Unable to update verification.");

        }

    }

    catch(error){

        console.error(error);

        alert("Server Error.");

    }

}


/* =========================================
   Feature Artist
========================================= */

async function featureArtist(profileId){

    try{

        const response = await fetch(

            `${API_BASE_URL}/api/admin/feature/${profileId}`,

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

        else{

            alert(data.message || "Unable to update featured status.");

        }

    }

    catch(error){

        console.error(error);

        alert("Server Error.");

    }

}


/* =========================================
   Block / Unblock Artist
========================================= */

async function blockArtist(profileId){

    try{

        const response = await fetch(

            `${API_BASE_URL}/api/admin/block/${profileId}`,

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

        else{

            alert(data.message || "Unable to update block status.");

        }

    }

    catch(error){

        console.error(error);

        alert("Server Error.");

    }

}


/* =====================================================
   Edit About Modal
===================================================== */

function createEditAboutModal(){

    if(document.getElementById("editAboutModal")){

        return;

    }

    const modal = document.createElement("div");

    modal.id = "editAboutModal";

    modal.innerHTML = `

        <div class="edit-about-overlay">

            <div class="edit-about-modal">

                <div class="edit-about-header">

                    <div>

                        <div class="edit-about-label">
                            BMTheaterHub Admin
                        </div>

                        <h2>
                            Edit Artist About
                        </h2>

                        <p id="editAboutArtistName">
                            Artist Profile
                        </p>

                    </div>

                    <button
                        type="button"
                        class="edit-about-close"
                        id="editAboutCloseBtn"
                        aria-label="Close">
                        ×
                    </button>

                </div>


                <div class="edit-about-body">

                    <label
                        for="editAboutTextarea">
                        About
                    </label>

                    <textarea
                        id="editAboutTextarea"
                        maxlength="5000"
                        placeholder="Enter artist About..."
                    ></textarea>

                    <div class="edit-about-footer">

                        <span id="editAboutCounter">
                            0 / 5000
                        </span>

                        <span>
                            Maximum 5000 characters
                        </span>

                    </div>

                    <div
                        id="editAboutMessage"
                        class="edit-about-message">
                    </div>

                </div>


                <div class="edit-about-actions">

                    <button
                        type="button"
                        id="editAboutCancelBtn"
                        class="edit-about-cancel">
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="editAboutSaveBtn"
                        class="edit-about-save">
                        Save Changes
                    </button>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(modal);


    /* =========================================
       Modal Styles
    ========================================= */

    const style = document.createElement("style");

    style.id = "editAboutModalStyles";

    style.textContent = `

        #editAboutModal{

            display:none;

            position:fixed;

            inset:0;

            z-index:99999;

        }

        .edit-about-overlay{

            position:absolute;

            inset:0;

            display:flex;

            align-items:center;

            justify-content:center;

            padding:20px;

            background:rgba(7,10,20,.72);

            backdrop-filter:blur(8px);

        }

        .edit-about-modal{

            width:min(680px,100%);

            max-height:90vh;

            overflow:hidden;

            background:#ffffff;

            border-radius:20px;

            box-shadow:0 24px 80px rgba(0,0,0,.28);

            animation:editAboutModalIn .18s ease-out;

        }

        @keyframes editAboutModalIn{

            from{

                opacity:0;

                transform:translateY(12px) scale(.98);

            }

            to{

                opacity:1;

                transform:translateY(0) scale(1);

            }

        }

        .edit-about-header{

            display:flex;

            justify-content:space-between;

            gap:20px;

            padding:24px 26px 20px;

            border-bottom:1px solid #eceef3;

        }

        .edit-about-label{

            font-size:11px;

            font-weight:700;

            letter-spacing:1.2px;

            text-transform:uppercase;

            color:#5b3df5;

            margin-bottom:6px;

        }

        .edit-about-header h2{

            margin:0;

            color:#171923;

            font-size:22px;

        }

        .edit-about-header p{

            margin:6px 0 0;

            color:#707583;

            font-size:14px;

        }

        .edit-about-close{

            width:38px;

            height:38px;

            border:0;

            border-radius:50%;

            background:#f3f4f7;

            color:#3b3e48;

            font-size:26px;

            line-height:1;

            cursor:pointer;

            flex-shrink:0;

        }

        .edit-about-close:hover{

            background:#e9eaf0;

        }

        .edit-about-body{

            padding:24px 26px;

        }

        .edit-about-body label{

            display:block;

            margin-bottom:9px;

            color:#272a34;

            font-size:14px;

            font-weight:700;

        }

        #editAboutTextarea{

            width:100%;

            min-height:260px;

            resize:vertical;

            box-sizing:border-box;

            padding:16px;

            border:1px solid #dfe2e9;

            border-radius:13px;

            outline:none;

            color:#252832;

            background:#fafbfc;

            font-family:inherit;

            font-size:15px;

            line-height:1.7;

            transition:border-color .2s,box-shadow .2s;

        }

        #editAboutTextarea:focus{

            border-color:#5b3df5;

            background:#ffffff;

            box-shadow:0 0 0 4px rgba(91,61,245,.10);

        }

        .edit-about-footer{

            display:flex;

            justify-content:space-between;

            gap:12px;

            margin-top:8px;

            color:#8a8f9c;

            font-size:12px;

        }

        #editAboutCounter{

            font-weight:700;

            color:#5b3df5;

        }

        .edit-about-message{

            min-height:20px;

            margin-top:12px;

            font-size:13px;

            font-weight:600;

        }

        .edit-about-actions{

            display:flex;

            justify-content:flex-end;

            gap:10px;

            padding:18px 26px 24px;

            border-top:1px solid #eceef3;

        }

        .edit-about-actions button{

            min-height:44px;

            padding:0 20px;

            border-radius:10px;

            font-family:inherit;

            font-size:14px;

            font-weight:700;

            cursor:pointer;

            transition:transform .15s,opacity .15s,background .15s;

        }

        .edit-about-actions button:active{

            transform:scale(.98);

        }

        .edit-about-cancel{

            border:1px solid #dfe2e9;

            background:#ffffff;

            color:#454954;

        }

        .edit-about-cancel:hover{

            background:#f5f6f8;

        }

        .edit-about-save{

            border:0;

            background:#5b3df5;

            color:#ffffff;

            box-shadow:0 8px 20px rgba(91,61,245,.22);

        }

        .edit-about-save:hover{

            opacity:.92;

        }

        .edit-about-save:disabled{

            opacity:.6;

            cursor:not-allowed;

        }

        @media(max-width:600px){

            .edit-about-overlay{

                align-items:flex-end;

                padding:0;

            }

            .edit-about-modal{

                width:100%;

                max-height:94vh;

                border-radius:20px 20px 0 0;

            }

            .edit-about-header{

                padding:20px;

            }

            .edit-about-body{

                padding:20px;

            }

            .edit-about-actions{

                padding:16px 20px 20px;

            }

            #editAboutTextarea{

                min-height:220px;

            }

            .edit-about-actions button{

                flex:1;

            }

        }

    `;

    document.head.appendChild(style);


    /* =========================================
       Elements
    ========================================= */

    const textarea =
        document.getElementById("editAboutTextarea");

    const counter =
        document.getElementById("editAboutCounter");

    const artistName =
        document.getElementById("editAboutArtistName");

    const message =
        document.getElementById("editAboutMessage");

    const saveBtn =
        document.getElementById("editAboutSaveBtn");

    const closeBtn =
        document.getElementById("editAboutCloseBtn");

    const cancelBtn =
        document.getElementById("editAboutCancelBtn");


    /* =========================================
       Counter
    ========================================= */

    textarea.addEventListener("input", () => {

        counter.textContent =
            `${textarea.value.length} / 5000`;

    });


    /* =========================================
       Close
    ========================================= */

    function closeModal(){

        modal.style.display = "none";

        textarea.value = "";

        message.textContent = "";

        saveBtn.disabled = false;

        saveBtn.textContent = "Save Changes";

    }


    closeBtn.addEventListener(
        "click",
        closeModal
    );

    cancelBtn.addEventListener(
        "click",
        closeModal
    );


    modal
        .querySelector(".edit-about-overlay")
        .addEventListener("click", (event) => {

            if(
                event.target.classList.contains(
                    "edit-about-overlay"
                )
            ){

                closeModal();

            }

        });


    document.addEventListener("keydown", (event) => {

        if(
            event.key === "Escape" &&
            modal.style.display === "block"
        ){

            closeModal();

        }

    });


    /* =========================================
       Save
    ========================================= */

    saveBtn.addEventListener("click", async () => {

        const profileId =
            modal.dataset.profileId;

        const about =
            textarea.value.trim();


        if(!about){

            message.textContent =
                "About cannot be empty.";

            message.style.color = "#d93025";

            return;

        }


        if(about.length > 5000){

            message.textContent =
                "About cannot exceed 5000 characters.";

            message.style.color = "#d93025";

            return;

        }


        saveBtn.disabled = true;

        saveBtn.textContent = "Saving...";

        message.textContent = "Updating profile...";

        message.style.color = "#5b3df5";


        try{

            const response = await fetch(

                `${API_BASE_URL}/api/admin/profile/${profileId}/about`,

                {

                    method:"PATCH",

                    headers:{

                        "Content-Type":"application/json",

                        Authorization:`Bearer ${token}`

                    },

                    body:JSON.stringify({

                        about

                    })

                }

            );


            const data = await response.json();


            if(!response.ok || !data.success){

                message.textContent =
                    data.message ||
                    "Unable to update About.";

                message.style.color = "#d93025";

                saveBtn.disabled = false;

                saveBtn.textContent = "Save Changes";

                return;

            }


            message.textContent =
                "About updated successfully.";

            message.style.color = "#188038";


            setTimeout(() => {

                closeModal();

                loadArtists();

            }, 600);

        }

        catch(error){

            console.error(
                "Admin About Update Error:",
                error
            );

            message.textContent =
                "Server Error. Please try again.";

            message.style.color = "#d93025";

            saveBtn.disabled = false;

            saveBtn.textContent = "Save Changes";

        }

    });

}


/* =====================================================
   Open Edit About Modal
===================================================== */

async function openEditAboutModal(
    profileId,
    name
){

    createEditAboutModal();

    const modal =
        document.getElementById("editAboutModal");

    const textarea =
        document.getElementById("editAboutTextarea");

    const artistName =
        document.getElementById("editAboutArtistName");

    const counter =
        document.getElementById("editAboutCounter");

    const message =
        document.getElementById("editAboutMessage");

    const saveBtn =
        document.getElementById("editAboutSaveBtn");


    modal.dataset.profileId =
        profileId;

    artistName.textContent =
        name || "Artist Profile";

    textarea.value = "";

    counter.textContent =
        "0 / 5000";

    message.textContent =
        "Loading About...";

    message.style.color =
        "#5b3df5";

    saveBtn.disabled = true;

    modal.style.display =
        "block";


    try{

        const response = await fetch(

            `${API_BASE_URL}/api/profile/${profileId}`

        );

        const profile = await response.json();


        if(!response.ok){

            throw new Error(
                profile.message ||
                "Unable to load profile."
            );

        }


        textarea.value =
            profile.about || "";

        counter.textContent =
            `${textarea.value.length} / 5000`;

        message.textContent = "";

        saveBtn.disabled = false;


        setTimeout(() => {

            textarea.focus();

        }, 100);

    }

    catch(error){

        console.error(
            "Load About Error:",
            error
        );

        message.textContent =
            "Unable to load About. Please try again.";

        message.style.color =
            "#d93025";

        saveBtn.disabled = false;

    }

}
/* =========================================
   Live Search
========================================= */

const searchArtist =
    document.getElementById("searchArtist");

if(searchArtist){

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

}


/* =========================================
   Refresh Dashboard
========================================= */

const refreshDashboardBtn =
    document.getElementById("refreshDashboardBtn");

if(refreshDashboardBtn){

    refreshDashboardBtn.addEventListener(
        "click",
        () => {

            loadDashboard();

            loadArtists();

        }
    );

}


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

    console.log(
        "Deactivate ID:",
        profileId
    );

    try{

        const response = await fetch(

            `${API_BASE_URL}/api/admin/deactivate/${profileId}`,

            {

                method:"PATCH",

                headers:{
                    Authorization:`Bearer ${token}`
                }

            }

        );

        const data = await response.json();

        console.log(
            "Deactivate Response:",
            data
        );

        if(data.success){

            loadDashboard();

            loadArtists();

        }

        else{

            alert(
                data.message ||
                "Unable to update artist status."
            );

        }

    }

    catch(error){

        console.error(
            "Deactivate Error:",
            error
        );

        alert("Server Error.");

    }

}