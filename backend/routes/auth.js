const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
    {
        userId: user._id,
        role: user.role
    },
        process.env.JWT_SECRET,
    {
        expiresIn: "30d"
    }
  );

        res.status(201).json({
            message: "Signup successful",
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

         console.log("Login User:", {
         email: user.email,
         role: user.role
     });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
     {
        userId: user._id,
        role: user.role
     },
        process.env.JWT_SECRET,
     {
        expiresIn: "30d"
     }
   );

        res.json({

        message: "Login successful",

        token,

         user: {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role

    }

});

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

    /* =========================================
         Forgot Password
      ========================================= */

router.post(

    "/forgot-password",

    async (req, res) => {

        try{

            const { email } = req.body;

            if(!email){

                return res.status(400).json({

                    success:false,

                    message:"Email is required."

                });

            }

            const user = await User.findOne({ email });

            if(!user){

                return res.status(404).json({

                    success:false,

                    message:"No account found with this email."

                });

            }

            const resetToken = crypto
                .randomBytes(32)
                .toString("hex");

            user.resetPasswordToken =
                resetToken;

            user.resetPasswordExpires =
                Date.now() + 1000 * 60 * 30;

            await user.save();

            const resetLink =

`https://bm-theater-hub.vercel.app/reset-password.html?token=${resetToken}`;

await sendEmail({

    to: user.email,

    subject: "Reset Your BmTheaterHub Password",

    html: `

        <h2>BmTheaterHub Password Reset</h2>

        <p>Hello ${user.name},</p>

        <p>You requested to reset your password.</p>

        <p>

            <a href="${resetLink}">

                Click here to Reset Password

            </a>

        </p>

        <p>This link will expire in 30 minutes.</p>

        <p>If you did not request this, please ignore this email.</p>

    `

});
            return res.json({

            success:true,

            message:"Password reset email sent successfully."

         });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:error.message

            });

        }

    }

);

const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select("-password");

    res.json(user);
});

     /* =========================================
   Reset Password
========================================= */

router.post(

    "/reset-password",

    async (req, res) => {

        try{

            const {

                token,

                password

            } = req.body;

            if(!token || !password){

                return res.status(400).json({

                    success:false,

                    message:"Token and password are required."

                });

            }

            const user = await User.findOne({

                resetPasswordToken: token,

                resetPasswordExpires: {

                    $gt: Date.now()

                }

            });

            if(!user){

                return res.status(400).json({

                    success:false,

                    message:"Invalid or expired reset link."

                });

            }

            user.password = await bcrypt.hash(

                password,

                10

            );

            user.resetPasswordToken = "";

            user.resetPasswordExpires = null;

            await user.save();

            return res.json({

                success:true,

                message:"Password reset successfully."

            });

        }

        catch(error){

            console.error(error);

            return res.status(500).json({

                success:false,

                message:error.message

            });

        }

    }

);

module.exports = router;