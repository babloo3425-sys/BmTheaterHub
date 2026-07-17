const token = localStorage.getItem("token");

let currentProfileId = "";

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

        currentProfileId = profile._id;

        // =========================================
       //      Show Admin Button
      // =========================================

        if (profile.role === "admin") {

        document
            .getElementById("adminPanelBtn")
            .style.display = "inline-block";

       }

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

        /* =========================================
                Resume Status
        ========================================= */

        const resumeStatus =
        document.getElementById("resumeStatus");

        const viewResumeBtn =
        document.getElementById("viewResumeBtn");

       if(profile.resume){

        resumeStatus.textContent =
          "📄 Resume : Uploaded";

       viewResumeBtn.style.display = "inline-block";

       viewResumeBtn.onclick = () => {

    const previewUrl =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(profile.resume);

    window.open(previewUrl, "_blank");

};

    }
      else{

       resumeStatus.textContent =
        "📄 Resume : Not Uploaded";

       viewResumeBtn.style.display = "none";

   }

      /* =========================================
             Performance Video Status
      ========================================= */

      const videoStatus =
      document.getElementById("videoStatus");

      const videoBtn =
      document.getElementById("videoBtn");

      if(profile.performanceVideo){

      videoStatus.textContent =
        "🎬 Performance Video : Uploaded";

      videoBtn.innerHTML =
        "▶ View Performance Video";

      videoBtn.onclick = () => {

        window.open(
            profile.performanceVideo,
            "_blank"
        );

    };

     }
       else{

    videoStatus.textContent =
    "🎬 Performance Video : Not Uploaded";

    videoBtn.innerHTML =
    "🎬 Upload Performance Video";

    videoBtn.onclick = () => {

    performanceVideoInput.value = "";

    performanceVideoInput.click();

    };

 }

     /* =========================================
   Profile Completion
========================================= */

let completed = 0;

if(profile.profileImage){

    completed += 25;

}

if(profile.about){

    completed += 25;

}

if(profile.resume){

    completed += 25;

}

if(profile.performanceVideo){

    completed += 25;

}

const progressFill =
document.getElementById("progressFill");

const progressText =
document.getElementById("progressText");

progressFill.style.width =
completed + "%";

progressText.textContent =
completed + "% Complete";

if(completed < 50){

    progressFill.style.background =
    "#ef4444";

}
else if(completed < 100){

    progressFill.style.background =
    "#f59e0b";

}
else{

    progressFill.style.background =
    "#22c55e";

}

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

    /* =========================================
           Resume Upload
    ========================================= */

    const uploadResumeBtn =
    document.getElementById("uploadResumeBtn");

   /* =========================================
          Performance Video Upload
        ========================================= */

    const videoBtn =
    document.getElementById("videoBtn");

    const performanceVideoInput =
    document.getElementById("performanceVideoInput");

    performanceVideoInput.addEventListener(

    "change",

    uploadPerformanceVideo

);

    const resumeInput =
    document.getElementById("resumeInput");

    uploadResumeBtn.addEventListener("click", () => {

    resumeInput.click();

});

resumeInput.addEventListener("change", uploadResume);

    changePhotoBtn.addEventListener("click", () => {

    profileImageInput.click();

});

profileImageInput.addEventListener("change", uploadProfilePhoto);

async function uploadProfilePhoto() {

    const file = profileImageInput.files[0];

    if (file.size > 5 * 1024 * 1024) {

    showToast(
        "Profile photo must be less than 5 MB.",
        "error"
    );

    return;

}

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

        showToast(
         data.message,
         "success"
    );
        await loadProfile();

    }

    catch(error){

    console.error(error);

    showToast(
        error.message,
        "error"
    );

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

        if (!currentProfileId) {

            alert("Profile is still loading.");

            return;

        }

        window.open(
            "profile.html?id=" + currentProfileId,
            "_blank"
        );

    });

    // =========================================
   //     Admin Panel
  // =========================================

     document
        .getElementById("adminPanelBtn")
        .addEventListener("click", () => {

        window.location.href = "admin.html";

});

/* =========================================
   Upload Resume
========================================= */

async function uploadResume(){

    const file = resumeInput.files[0];

    if (file.size > 5 * 1024 * 1024) {

    showToast(
        "Resume PDF must be less than 5 MB.",
        "error"
    );

    return;

}

    if(!file){

        return;

    }

    const formData = new FormData();

    formData.append("resume", file);

    try{

        const response = await fetch(

            "http://localhost:5002/api/upload/resume",

            {

                method:"POST",

                headers:{

                    Authorization:
                        "Bearer " + localStorage.getItem("token")

                },

                body:formData

            }

        );

        console.log("Status:", response.status);

        const text = await response.text();

        console.log(text);

       return;

        console.log(data);

        if(!response.ok){

            throw new Error(data.message);

        }

        showToast(
        "Resume uploaded successfully.",
         "success"
     );

        loadProfile();

    }

    catch(error){

        console.error(error);

        showToast(
        error.message,
        "error"
    );

    }

}

   /* =========================================
   Upload Performance Video
========================================= */

async function uploadPerformanceVideo(){

    const file = performanceVideoInput.files[0];

if(!file){

    return; 

}

if (!file.type.startsWith("video/")) {

    showToast(
        "Please select a valid video file.",
        "error"
    );

    return;

}

if (file.size > 50 * 1024 * 1024) {

    showToast(
        "Performance video must be less than 50 MB.",
        "error"
    );

    return;

}

    const formData = new FormData();

    formData.append("performanceVideo", file);

    try{

        const response = await fetch(

            "http://localhost:5002/api/upload/performance-video",

            {

                method:"POST",

                headers:{

                    Authorization:
                        "Bearer " + localStorage.getItem("token")

                },

                body:formData

            }

        );

        const data = await response.json();

        console.log(data);

        if(!response.ok){

            throw new Error(data.message);

        }

        await loadProfile();

        showToast(
          "Performance video uploaded successfully.",
          "success"
     );

    }

    catch(error){

        console.error(error);

        showToast(
        error.message,
       "error"
    );

 }

}

/* =========================================
   Professional Toast Notification
========================================= */

function showToast(message, type = "success") {

    const oldToast = document.getElementById("toast");

    if (oldToast) {

        oldToast.remove();

    }

    const toast = document.createElement("div");

    toast.id = "toast";

    toast.className = `toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}