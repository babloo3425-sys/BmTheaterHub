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
/* =========================================
   Welcome Email
========================================= */

      try {

      await sendEmail({

        to: user.email,

        subject: "Welcome to BMTheaterHub 🎭",

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

        Welcome to BMTheaterHub 🎭

    </h2>

    <p style="font-size:16px;color:#555;line-height:1.8;">

    Hello <strong>${user.name}</strong>,

    </p>

    <p style="font-size:16px;color:#555;line-height:1.8;">

        Your account has been created successfully.

        Welcome to India's Theatre Marketplace.

    </p>

    <div style="text-align:center;margin:35px 0;">

    <a href="https://bmtheaterhub.com/create-profile.html"

    style="
    background:#5b3df5;
    color:#ffffff;
    padding:16px 36px;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
    display:inline-block;
   ">

    Create Your Artist Profile

   </a>

   </div>

   <p style="
    font-size:15px;
    color:#666;
    line-height:1.8;
    ">

    Start building your theatre journey by creating your professional artist profile and connecting with directors, theatre groups and performers across India.

   </p>

   <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

   <div style="text-align:center;">

   <a
    href="https://bmtheaterhub.com"
    style="
    display:inline-block;
    padding:12px 28px;
    border:2px solid #5b3df5;
    color:#5b3df5;
    text-decoration:none;
    border-radius:8px;
    font-weight:bold;
   ">

    Explore BMTheaterHub

  </a>

  </div>

  </td>

  </tr>

  <tr>

  <td style="
   background:#fafafa;
   padding:25px;
   text-align:center;
   font-size:13px;
   color:#777;
   ">

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

    catch(error){

    console.error("Welcome Email Error:", error);

 }

    const token = jwt.sign(
  {
    userId: user._id,
    role: user.role
 },
    process.env.JWT_SECRET,
 {
    expiresIn:"30d"
 }
 );

    res.status(201).json({

    message:"Signup successful",

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

 `https://bmtheaterhub.com/reset-password.html?token=${resetToken}`;

await sendEmail({

    to: user.email,

    subject: "Reset Your BmTheaterHub Password",

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
<td style="background:#5b3df5;padding:28px;text-align:center;">

<div style="text-align:center;">

<img
src="https://bmtheaterhub.com/assets/logo.png"
alt="BMTheaterHub"
width="170"
style="display:block;margin:0 auto;">

</div>

<p style="
margin-top:15px;
color:#ece8ff;
font-size:15px;
text-align:center;
">

India's Theatre Marketplace

</p>

</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#222;">
Reset Your Password
</h2>

<p style="font-size:16px;color:#555;line-height:1.8;">
Hello <strong>${user.name}</strong>,
</p>

<p style="font-size:16px;color:#555;line-height:1.8;">
We received a request to reset your
BMTheaterHub account password.
</p>

<div style="text-align:center;margin:35px 0;">

<a href="${resetLink}"

style="
background:#5b3df5;
color:#ffffff;
text-decoration:none;
padding:16px 38px;
display:inline-block;
border-radius:8px;
font-size:17px;
font-weight:bold;">

Reset Password

</a>

</div>

<div style="
background:#fff8e8;
border-left:5px solid #ffb300;
padding:18px;
border-radius:8px;
font-size:15px;
color:#555;
">

⏰ This reset link will expire in
<strong>30 minutes.</strong>

</div>

<p style="margin-top:30px;font-size:15px;color:#555;line-height:1.8;">

If the button doesn't work, copy and paste this link into your browser:

</p>

<p style="
word-break:break-all;
font-size:13px;
color:#5b3df5;
">

${resetLink}

</p>

<hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

<p style="font-size:14px;color:#777;line-height:1.8;">

If you didn't request a password reset,
you can safely ignore this email.
Your password will remain unchanged.

</p>

</td>
</tr>

<tr>

<td style="
background:#fafafa;
padding:25px;
text-align:center;
font-size:13px;
color:#777;
">

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