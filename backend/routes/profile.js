const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/create", auth, async (req, res) => {
    try {

        const existingProfile = await Profile.findOne({
            userId: req.user.userId
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Profile already exists"
            });
        }

        const profile = await Profile.create({
            userId: req.user.userId,
            ...req.body
        });

        res.status(201).json({
            message: "Profile created successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/me", auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({
        userId: req.user.userId
    });

        const User = require("../models/User");

        const user = await User.findById(req.user.userId)
          .select("role");

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.json({

        ...profile.toObject(),

         role: user.role

        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put("/update", auth, async (req, res) => {

    try {

        const profile = await Profile.findOneAndUpdate(

            {
                userId: req.user.userId
            },

            {
                $set: {
                    name: req.body.name,
                    profileType: req.body.profileType,
                    city: req.body.city,
                    state: req.body.state,
                    experience: req.body.experience,
                    about: req.body.about,
                    whatsapp: req.body.whatsapp
                }
            },

            {
                new: true
            }

        );

        if (!profile) {

            return res.status(404).json({

                message: "Profile not found"

            });

        }

        res.json({

            message: "Profile Updated Successfully",

            profile

        });

    }

    catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

});
        router.get("/all", async (req, res) => {

    try {

        const profiles = await Profile.find({
              blocked: false,
              active: true
    })

        .select(
            "name profileType city state experience about whatsapp profileImage verified featured blocked createdAt"
          )

            .sort({ createdAt: -1 });

        res.json({

            success: true,

            count: profiles.length,

            profiles

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

        router.get("/search", async (req, res) => {

    try {

        const keyword = req.query.keyword || "";

        const profiles = await Profile.find({

              blocked: false,

              $or: [

                {
                    name: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    profileType: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    city: {
                        $regex: keyword,
                        $options: "i"
                    }
                },

                {
                    state: {
                        $regex: keyword,
                        $options: "i"
                    }
                }

            ]

        }).sort({ createdAt: -1 });

        res.json({

            success: true,

            profiles

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

router.get("/:id", async (req, res) => {

    try {

        const profile = await Profile.findOne({
              _id: req.params.id,
              blocked: false
         });

        if (!profile) {

            return res.status(404).json({

               message: "Artist profile not available."

            });

        }

        res.json(profile);

    }

    catch(error){

        res.status(500).json({

            message: error.message

        });

    }

});

module.exports = router;