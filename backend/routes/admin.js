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