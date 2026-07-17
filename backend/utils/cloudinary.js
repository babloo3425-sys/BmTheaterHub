const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});

/* =========================================================
   Profile Image Storage
========================================================= */

const profileImageStorage = new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "BmTheaterHub/ProfileImages",

        allowed_formats: ["jpg", "jpeg", "png", "webp"]

    }

});

/* =========================================================
   Resume Storage
========================================================= */

const resumeStorage = new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "BmTheaterHub/Resumes",

        resource_type: "raw",

        allowed_formats: ["pdf"]

    }

});

/* =========================================================
   Performance Video Storage
========================================================= */

const videoStorage = new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "BmTheaterHub/PerformanceVideos",

        resource_type: "video",

        allowed_formats: ["mp4", "mov", "webm"]

    }

});

module.exports = {

    cloudinary,

    profileImageStorage,

    resumeStorage,

    videoStorage

};