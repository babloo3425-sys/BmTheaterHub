const express = require("express");
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");
const sendEmail = require("../utils/email");
const User = require("../models/User");

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

    /* =========================================
        Profile Created Email
    ========================================= */

    try {

    const user = await User.findById(req.user.userId);

    if(user){

        await sendEmail({

            to: user.email,

            subject: "🎉 Your BMTheaterHub Profile is Live!",

            html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        </head>

    <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
    <tr>
    <td align="center">

    <table width="600" cellpadding="0" cellspacing="0"
    style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,.08);">

    <tr>
    <td style="background:#5b3df5;padding:30px;text-align:center;">

    <img
    src="https://bmtheaterhub.com/assets/logo.png"
    width="170"
    alt="BMTheaterHub">

    </td>
    </tr>

    <tr>
    <td style="padding:40px;">

    <h2 style="margin-top:0;color:#222;">
   🎉 Your Profile is Live
    </h2>

    <p style="font-size:16px;color:#555;line-height:1.8;">
       Hello <strong>${user.name}</strong>,
    </p>

    <p style="font-size:16px;color:#555;line-height:1.8;">
    Congratulations! Your BMTheaterHub artist profile has been created successfully and is now available on the platform.
    </p>

    <div style="text-align:center;margin:35px 0;">

    <a
    href="https://bmtheaterhub.com/dashboard.html"
    style="
    background:#5b3df5;
    color:#ffffff;
    padding:16px 34px;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
    display:inline-block;">

    Go to Dashboard

    </a>

    </div>

       <div style="text-align:center;">

    <a
      href="https://bmtheaterhub.com/artists.html"
      style="
      display:inline-block;
      padding:12px 28px;
      border:2px solid #5b3df5;
      color:#5b3df5;
      text-decoration:none;
      border-radius:8px;
      font-weight:bold;">

      Explore Artists

    </a>

    </div>

    <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

    <p style="font-size:15px;color:#666;line-height:1.8;">

    ✔ Share your profile with directors and theatre groups.<br>
    ✔ Keep your profile updated regularly.<br>
    ✔ Showcase your experience and talent.

    </p>

    </td>
    </tr>

    <tr>
    <td style="background:#fafafa;padding:25px;text-align:center;font-size:13px;color:#777;">

    © 2026 BMTheaterHub

    <br><br>

    www.bmtheaterhub.com

    </td>
    </tr>

    </table>

    </td>
    </tr>
    </table>

    </body>
    </html>
   `

        });

    }

 }

    catch(error){

    console.error("Profile Email Error:", error);

 }

    res.status(201).json({

    message:"Profile created successfully",

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