const params = new URLSearchParams(window.location.search);

const profileId = params.get("id");

async function loadPublicProfile() {

    try {

        const response = await fetch(

            `${API_BASE_URL}/api/profile/${profileId}`
        );

            console.log(response.status);

        const profile = await response.json();

        console.log(profile);

        document.getElementById("name").textContent =
            profile.name;

        document.getElementById("profileType").textContent =
            "🎭 " + profile.profileType;

        document.getElementById("city").textContent =
            "📍 " + profile.city + ", " + profile.state;

        document.getElementById("experience").textContent =
            "⭐ " + profile.experience;

        document.getElementById("about").textContent =
            profile.about;

        document.getElementById("profileImage").src =
            profile.profileImage ||
            "images/default-avatar.png";

        document.getElementById("whatsappBtn").href =
            "https://wa.me/91" + profile.whatsapp;

        /* =========================================
              Resume Button
    ========================================= */

        const viewResumeBtn =
        document.getElementById("viewResumeBtn");

        if(profile.resume){

        viewResumeBtn.style.display =
        "inline-block";

        viewResumeBtn.onclick = () => {

        const previewUrl =
        "https://docs.google.com/gview?embedded=1&url=" +
        encodeURIComponent(profile.resume);

        window.open(previewUrl, "_blank");

    };

    }
       else{

        viewResumeBtn.style.display =
        "none";

    }

    /* =========================================
          Performance Video Button
       ========================================= */

        const viewPerformanceBtn =
        document.getElementById("viewPerformanceBtn");

        if(profile.performanceVideo){

        viewPerformanceBtn.style.display =
         "inline-block";

        viewPerformanceBtn.onclick = () => {

        window.open(
            profile.performanceVideo,
            "_blank"
        );

    };

    }
       else{

        viewPerformanceBtn.style.display =
        "none";

    }


        /* ===========================
               Badges
         =========================== */

         const featuredBadge =
         document.getElementById("featuredBadge");

         const verifiedBadge =
         document.getElementById("verifiedBadge");

         if (profile.featured === true) {

         featuredBadge.style.display = "inline-flex";

        } else {

            featuredBadge.style.display = "none";

        }

            if (profile.verified === true) {

           verifiedBadge.style.display = "inline-flex";

         } else {

            verifiedBadge.style.display = "none";

         }

        }

            catch(error){

            console.log(error);

         }

      }

          loadPublicProfile();

        /* ===========================
             Share Profile
         =========================== */

        const shareProfileBtn = document.getElementById("shareProfileBtn");

        shareProfileBtn.addEventListener("click", async () => {

        const shareData = {
        title: document.getElementById("name").textContent,
        text: "Check out this artist on BM TheaterHub",
        url: window.location.href
    };

         // Android App Native Share
        if (window.Android && typeof window.Android.share === "function") {

        window.Android.share(
        shareData.title,
        shareData.text,
        shareData.url
    );

    return;
}
    // Native Share
    if (navigator.share) {

        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            console.log(err);
        }
    }

    // Fallback
    try {

        await navigator.clipboard.writeText(window.location.href);

        alert("Profile link copied.\nNow paste it anywhere to share.");

    } catch (err) {

        prompt("Copy this profile link:", window.location.href);

    }

});

         /* ===========================
                Copy Profile Link
            =========================== */

       const copyLinkBtn =
        document.getElementById("copyLinkBtn");

        copyLinkBtn.addEventListener("click", async () => {

      try{

        await navigator.clipboard.writeText(

            window.location.href

        );

        alert("Profile link copied successfully.");

      }

      catch(error){

        console.log(error);

     }

});