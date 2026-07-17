const express = require("express");
const multer = require("multer");

const auth = require("../middleware/auth");

const {
    profileImageStorage,
    resumeStorage,
    videoStorage
} = require("../utils/cloudinary");

const Profile = require("../models/Profile");

const router = express.Router();

const profileUpload = multer({

    storage: profileImageStorage

});

const resumeUpload = multer({

    storage: resumeStorage

});

const videoUpload = multer({

    storage: videoStorage

});
console.log("✅ Upload Route Loaded");

router.post(

    "/profile-photo",

    auth,

    profileUpload.single("profileImage"),

    async (req, res) => {

        console.log("📷 Upload Request Reached");

        try{

            console.log("User:", req.user);

            console.log("File:", req.file);

            const profile = await Profile.findOne({

                userId: req.user.userId

            });

            console.log("Profile:", profile);

            if(!profile){

                return res.status(404).json({

                    message:"Profile not found"

                });

            }

            profile.profileImage = req.file.path;

            await profile.save();

            res.json({

                message:"Photo Uploaded Successfully",

                imageUrl:req.file.path

            });

        }

        catch(error){

    console.error("UPLOAD ERROR:");

    console.error(error);

    res.status(500).json({

        message:error.message

    });

}

    }

);

/*
=========================================================
     Upload Resume PDF
=========================================================
*/

router.post(

    "/resume",

    auth,

    resumeUpload.single("resume"),

    async (req, res) => {

        try {

        console.log("Resume File:", req.file);
        console.log("Resume Body:", req.body);

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "Resume file is required."

                });

            }

            const profile = await Profile.findOne({

                userId: req.user.userId

            });

            if (!profile) {

                return res.status(404).json({

                    success: false,

                    message: "Profile not found."

                });

            }

            profile.resume = req.file.path;

            await profile.save();

            return res.json({

                success: true,

                message: "Resume uploaded successfully.",

                resume: profile.resume

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

);

   /*========================================================
            Upload Performance Video
    =========================================================*/

 router.post(

     "/performance-video",

    auth,

    videoUpload.single("performanceVideo"),

    async (req, res) => {

        try {

            console.log("Video File:", req.file);

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "Performance video is required."

                });

            }

            const profile = await Profile.findOne({

                userId: req.user.userId

            });

            if (!profile) {

                return res.status(404).json({

                    success: false,

                    message: "Profile not found."

                });

            }

            profile.performanceVideo = req.file.path;

            await profile.save();

            return res.json({

                success: true,

                message: "Performance video uploaded successfully.",

                video: profile.performanceVideo

            });

        }

        catch (error) {

            console.error(error);

            return res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

);

module.exports = router;