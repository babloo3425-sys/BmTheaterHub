const express = require("express");
const multer = require("multer");

const auth = require("../middleware/auth");

const { storage } = require("../utils/cloudinary");

const Profile = require("../models/Profile");

const router = express.Router();

const upload = multer({ storage });

console.log("✅ Upload Route Loaded");

router.post(

    "/profile-photo",

    auth,

    upload.single("profileImage"),

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

module.exports = router;