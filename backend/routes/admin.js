const express = require("express");

// =====================================================
// Middleware
// =====================================================
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// =====================================================
// Models
// =====================================================
const User = require("../models/User");
const Profile = require("../models/Profile");

const sendEmail = require("../utils/email");

const router = express.Router();

/*
=========================================================
Admin Dashboard Statistics
Only Admin Can Access
=========================================================
*/

router.get("/dashboard", auth, admin, async (req, res) => {

    try {

        // =============================================
        // Dashboard Statistics
        // =============================================
        const totalUsers = await User.countDocuments();

        const totalArtists = await Profile.countDocuments();

        const featuredArtists = await Profile.countDocuments({
            featured: true
        });

        const verifiedArtists = await Profile.countDocuments({
            verified: true
        });

        const blockedArtists = await Profile.countDocuments({
            blocked: true
        });

        // =============================================
        // Success Response
        // =============================================
        return res.status(200).json({

            success: true,

            message: "Admin Dashboard Loaded",

            admin: req.user,

            statistics: {

                totalUsers,

                totalArtists,

                featuredArtists,

                verifiedArtists,

                blockedArtists

            }

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

/*
=========================================================
Verify / Unverify Artist
Only Admin Can Access
=========================================================
*/

router.patch("/verify/:profileId", auth, admin, async (req, res) => {

    try {

        // =============================================
        // Find Artist Profile
        // =============================================
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Artist profile not found."
            });
        }

        // =============================================
        // Toggle Verification Status
        // =============================================
        profile.verified = !profile.verified;

        await profile.save();

    /* =========================================
            Verification Email
    ========================================= */

    try {

        const user = await User.findById(profile.userId);

        if (user) {

            if (profile.verified) {

            await sendEmail({

                to: user.email,

                subject: "🎉 Your BMTheaterHub Profile Has Been Verified!",

                html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
    <tr>
    <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

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

        <h2 style="color:#222;margin-top:0;">
        🎉 Congratulations!
        </h2>

    <p style="font-size:16px;color:#555;line-height:1.8;">

    Hello <strong>${user.name}</strong>,

    </p>

    <p style="font-size:16px;color:#555;line-height:1.8;">

    Your artist profile has been officially
    <strong>Verified</strong> on BMTheaterHub.

    Your profile now carries additional trust and visibility on the platform.

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
    display:inline-block;
    font-weight:bold;
    ">

    Go to Dashboard

    </a>

    </div>

    <p style="font-size:15px;color:#666;line-height:1.8;">

   ✔ Keep your profile updated.<br>
   ✔ Share your profile with directors.<br>
   ✔ Showcase your latest work.

    </p>

    <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

    <p style="text-align:center;font-size:13px;color:#777;">

    © 2026 BMTheaterHub

    <br><br>

    www.bmtheaterhub.com

    </p>

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

}

    catch(error){

    console.error("Verification Email Error:", error);

}

        // =============================================
        // Success Response
        // =============================================
        return res.status(200).json({

            success: true,

            message: profile.verified
                ? "Artist verified successfully."
                : "Artist verification removed.",

            verified: profile.verified

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

/*
=========================================================
Feature / Unfeature Artist
Only Admin Can Access
=========================================================
*/

router.patch("/feature/:profileId", auth, admin, async (req, res) => {

    try {

        // =============================================
        // Find Artist Profile
        // =============================================
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Artist profile not found."
            });
        }

        // =============================================
        // Toggle Featured Status
        // =============================================
        profile.featured = !profile.featured;

        await profile.save();

        // =============================================
        // Success Response
        // =============================================
        return res.status(200).json({

            success: true,

            message: profile.featured
                ? "Artist featured successfully."
                : "Artist removed from featured list.",

            featured: profile.featured

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

/*
=========================================================
Block / Unblock Artist
Only Admin Can Access
=========================================================
*/

router.patch("/block/:profileId", auth, admin, async (req, res) => {

    try {

        const profile = await Profile.findById(req.params.profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Artist profile not found."
            });
        }

        // Toggle Block Status
        profile.blocked = !profile.blocked;

        await profile.save();

        return res.status(200).json({
            success: true,
            message: profile.blocked
                ? "Artist blocked successfully."
                : "Artist unblocked successfully.",
            blocked: profile.blocked
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});

/*
=========================================================
Get All Artists (Admin Only)
Includes Blocked Artists
=========================================================
*/

router.get("/artists", auth, admin, async (req, res) => {

    try {

        const artists = await Profile.find()

        .select(
              "name profileType city state profileImage verified featured blocked active createdAt"
        )

            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            count: artists.length,

            artists

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

/*
=========================================================
Deactivate / Activate Artist
Only Admin Can Access
=========================================================
*/

router.patch("/deactivate/:profileId", auth, admin, async (req, res) => {

    try {

        const profile = await Profile.findById(req.params.profileId);

        if (!profile) {

            return res.status(404).json({

                success: false,

                message: "Artist profile not found."

            });

        }

        // =============================================
        // Toggle Active Status
        // =============================================

        profile.active = !profile.active;

        await profile.save();

        return res.status(200).json({

            success: true,

            message: profile.active
                ? "Artist activated successfully."
                : "Artist deactivated successfully.",

            active: profile.active

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

});

module.exports = router;