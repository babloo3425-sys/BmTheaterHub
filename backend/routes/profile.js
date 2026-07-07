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

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.json(profile);

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
            req.body,
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
            message: "Profile updated successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/all", async (req, res) => {
    try {

        const profiles = await Profile.find()
            .sort({ createdAt: -1 });

        res.json(profiles);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;