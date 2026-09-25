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

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        /*
        =========================================
        Secure Email Verification Token
        =========================================
        */

        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const verificationExpires =
            new Date(Date.now() + 30 * 60 * 1000);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,

            emailVerified: false,

            emailVerificationToken: verificationTokenHash,

            emailVerificationExpires: verificationExpires
        });

        /*
        =========================================
        Verification Link
        =========================================

        Localhost:
        http://localhost:5000

        Production:
        Set API_BASE_URL in Render environment.
        =========================================
        */

        const apiBaseUrl =
        process.env.API_BASE_URL ||
        "http://localhost:5002";

        const verificationLink =
            `${apiBaseUrl}/api/auth/verify-email?token=${verificationToken}`;

        /*
        =========================================
        Email Verification Email
        =========================================
        */

        try {
            await sendEmail({
                to: user.email,

                subject:
                    "Verify Your BMTheaterHub Email 🎭",

                html: `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1.0"
>

<title>Verify Your Email</title>

</head>

<body
    style="
        margin:0;
        padding:0;
        background:#f4f6fb;
        font-family:Arial,Helvetica,sans-serif;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 15px;"
>

<tr>

<td align="center">

<table
    width="600"
    cellpadding="0"
    cellspacing="0"
    style="
        max-width:600px;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 8px 25px rgba(0,0,0,.08);
    "
>

<tr>

<td
    style="
        background:#5b3df5;
        padding:30px;
        text-align:center;
    "
>

<img
    src="https://bmtheaterhub.com/assets/logo.png"
    width="170"
    alt="BMTheaterHub"
>

</td>

</tr>

<tr>

<td style="padding:40px;">

<h2
    style="
        margin-top:0;
        color:#222;
    "
>

Verify Your Email 🎭

</h2>

<p
    style="
        font-size:16px;
        color:#555;
        line-height:1.8;
    "
>

Hello <strong>${user.name}</strong>,

</p>

<p
    style="
        font-size:16px;
        color:#555;
        line-height:1.8;
    "
>

Your BMTheaterHub account has been created.

To activate your account, please verify that
you have access to this email address.

</p>

<div
    style="
        text-align:center;
        margin:35px 0;
    "
>

<a
    href="${verificationLink}"
    style="
        background:#5b3df5;
        color:#ffffff;
        padding:16px 36px;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
        display:inline-block;
    "
>

Verify My Email

</a>

</div>

<div
    style="
        background:#f5f2ff;
        border-left:5px solid #5b3df5;
        padding:18px;
        border-radius:8px;
        font-size:15px;
        color:#555;
        line-height:1.7;
    "
>

<strong>Security notice:</strong>

<br>

This verification link will expire in
<strong>30 minutes</strong> and can only be used once.

</div>

<p
    style="
        margin-top:30px;
        font-size:14px;
        color:#777;
        line-height:1.7;
    "
>

If you did not create this account, you can safely
ignore this email.

</p>

<hr
    style="
        border:none;
        border-top:1px solid #eee;
        margin:35px 0;
    "
>

<p
    style="
        text-align:center;
        font-size:13px;
        color:#777;
    "
>

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

        } catch (emailError) {

            console.error(
                "Verification Email Error:",
                emailError
            );

            /*
            -----------------------------------------
            Email send failed.
            Remove the newly-created unverified user
            so we don't leave an unusable account.
            -----------------------------------------
            */

            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                message:
                    "Unable to send verification email. Please try again."
            });
        }

        /*
        =========================================
        IMPORTANT:
        NO JWT TOKEN IS CREATED HERE.
        User must verify email first.
        =========================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully. Please check your email and verify your account before logging in."

        });

    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
});

/* =========================================
   Resend Verification Email
========================================= */

router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message:
                    "Email is already verified. You can log in."
            });
        }

        const now = Date.now();

        const lastSentAt = user.emailVerificationLastSentAt
            ? new Date(
                user.emailVerificationLastSentAt
            ).getTime()
            : 0;

        let sendCount =
            Number(user.emailVerificationSendCount) || 0;

        /*
        =========================================
        RATE LIMIT
        =========================================

        Minimum 60 seconds between emails.
        Maximum 5 emails within 1 hour.
        =========================================
        */

        if (
            lastSentAt &&
            now - lastSentAt < 60 * 1000
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Please wait 60 seconds before requesting another verification email."
            });
        }

        /*
        =========================================
        RESET HOURLY COUNTER
        =========================================
        */

        if (
            lastSentAt &&
            now - lastSentAt >= 60 * 60 * 1000
        ) {
            sendCount = 0;
        }

        if (sendCount >= 5) {
            return res.status(429).json({
                success: false,
                message:
                    "Too many verification email requests. Please try again after 1 hour."
            });
        }

        /*
        =========================================
        SAVE CURRENT STATE
        =========================================
        */

        const previousToken =
            user.emailVerificationToken;

        const previousExpires =
            user.emailVerificationExpires;

        const previousLastSentAt =
            user.emailVerificationLastSentAt;

        const previousSendCount =
            user.emailVerificationSendCount;

        /*
        =========================================
        GENERATE NEW SECURE TOKEN
        =========================================
        */

        const verificationToken =
            crypto.randomBytes(32).toString("hex");

        const verificationTokenHash =
            crypto
                .createHash("sha256")
                .update(verificationToken)
                .digest("hex");


                user.emailVerificationToken =
            verificationTokenHash;

        user.emailVerificationExpires =
        new Date(
        now + 24 * 60 * 60 * 1000
    );

        user.emailVerificationLastSentAt =
            new Date(now);

        user.emailVerificationSendCount =
            sendCount + 1;

        await user.save();

        /*
        =========================================
        VERIFICATION LINK
        =========================================
        */

        const apiBaseUrl =
            process.env.API_BASE_URL ||
            "http://localhost:5002";

        const verificationLink =
            `${apiBaseUrl}/api/auth/verify-email?token=${verificationToken}`;

        /*
        =========================================
        SEND EMAIL
        =========================================
        */

        try {

            await sendEmail({
                to: user.email,

                subject:
                    "Verify Your BMTheaterHub Email 🎭",

                html: `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1.0"
>

<title>Verify Your Email</title>

</head>

<body
    style="
        margin:0;
        padding:40px 15px;
        background:#f4f6fb;
        font-family:Arial,Helvetica,sans-serif;
    "
>

<div
    style="
        max-width:600px;
        margin:auto;
        background:#ffffff;
        padding:40px;
        border-radius:16px;
        text-align:center;
        box-shadow:0 8px 25px rgba(0,0,0,.08);
    "
>

<img
    src="https://bmtheaterhub.com/assets/logo.png"
    width="170"
    alt="BMTheaterHub"
>

<h2 style="color:#222;">
    Verify Your Email 🎭
</h2>

<p
    style="
        color:#555;
        line-height:1.7;
        font-size:16px;
    "
>
    Click the button below to verify your
    BMTheaterHub email address.
</p>

<a
    href="${verificationLink}"
    style="
        display:inline-block;
        background:#5b3df5;
        color:#ffffff;
        padding:16px 30px;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
        margin-top:15px;
    "
>
    Verify My Email
</a>

<p
    style="
        margin-top:25px;
        color:#777;
        font-size:13px;
        word-break:break-all;
    "
>
    ${verificationLink}
</p>

<div
    style="
        background:#fff8e8;
        border-left:5px solid #ffb300;
        padding:15px;
        border-radius:8px;
        color:#555;
        line-height:1.7;
        margin-top:25px;
        text-align:left;
    "
>
    ⏰ This verification link expires in
    <strong>30 minutes</strong>
    and can be used only once.
</div>

<p
    style="
        color:#777;
        font-size:14px;
        line-height:1.7;
        margin-top:25px;
    "
>
    If you did not request this email,
    you can safely ignore it.
</p>

<hr
    style="
        border:none;
        border-top:1px solid #eee;
        margin:35px 0;
    "
>

<p
    style="
        color:#777;
        font-size:13px;
    "
>
    © 2026 BMTheaterHub
    <br><br>
    www.bmtheaterhub.com
</p>

</div>

</body>

</html>
`
            });

        } catch (emailError) {

            /*
            =========================================
            EMAIL FAILED
            RESTORE PREVIOUS STATE
            =========================================
            */

            user.emailVerificationToken =
                previousToken;

            user.emailVerificationExpires =
                previousExpires;

            user.emailVerificationLastSentAt =
                previousLastSentAt;

            user.emailVerificationSendCount =
                previousSendCount;

            await user.save();

            console.error(
                "Resend Verification Email Error:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to send verification email. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Verification email sent successfully. Please check your inbox."
        });

    } catch (error) {

        console.error(
            "Resend Verification Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to process verification request."
        });
    }
});

// =========================================
      // Verify Email
     // =========================================

        router.get("/verify-email", async (req, res) => {
        try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1.0">
                    <title>Email Verification</title>
                </head>

                <body style="
                    margin:0;
                    padding:40px 20px;
                    background:#f4f6fb;
                    font-family:Arial,Helvetica,sans-serif;
                    text-align:center;
                ">

                    <div style="
                        max-width:500px;
                        margin:60px auto;
                        background:#fff;
                        padding:40px 25px;
                        border-radius:16px;
                        box-shadow:0 8px 25px rgba(0,0,0,.08);
                    ">

                        <h2 style="color:#d93025;">
                            Verification Link Invalid
                        </h2>

                        <p style="color:#555;line-height:1.7;">
                            The email verification link is missing or invalid.
                        </p>

                    </div>

                </body>
                </html>
            `);
        }

        /*
        =========================================
        Hash the token received from email
        =========================================
        */

        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        /*
        =========================================
        Find user with valid, unexpired token
        =========================================
        */

        const user = await User.findOne({
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1.0">
                    <title>Email Verification</title>
                </head>

                <body style="
                    margin:0;
                    padding:40px 20px;
                    background:#f4f6fb;
                    font-family:Arial,Helvetica,sans-serif;
                    text-align:center;
                ">

                    <div style="
                        max-width:500px;
                        margin:60px auto;
                        background:#fff;
                        padding:40px 25px;
                        border-radius:16px;
                        box-shadow:0 8px 25px rgba(0,0,0,.08);
                    ">

                        <h2 style="color:#d93025;">
                            Link Expired or Invalid
                        </h2>

                        <p style="color:#555;line-height:1.7;">
                            This verification link is invalid, expired,
                            or has already been used.
                        </p>

                        <p style="color:#777;line-height:1.7;">
                            Please request a new verification email.
                        </p>

                    </div>

                </body>
                </html>
            `);
        }

        /*
        =========================================
        Already verified protection
        =========================================
        */

        if (user.emailVerified) {
            return res.status(200).send(`
    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="UTF-8">
        <meta
            name="viewport"
            content="width=device-width,initial-scale=1.0"
        >
        <title>Email Already Verified</title>
    </head>

    <body style="
        margin:0;
        padding:40px 20px;
        background:#f4f6fb;
        font-family:Arial,Helvetica,sans-serif;
        text-align:center;
    ">

        <div style="
            max-width:500px;
            margin:60px auto;
            background:#fff;
            padding:40px 25px;
            border-radius:16px;
            box-shadow:0 8px 25px rgba(0,0,0,.08);
        ">

            <div style="
                font-size:55px;
                margin-bottom:15px;
            ">
                ✅
            </div>

            <h2 style="
                color:#28a745;
                margin-bottom:15px;
            ">
                Email Already Verified
            </h2>

            <p style="
                color:#555;
                line-height:1.7;
                font-size:16px;
            ">
                Your BMTheaterHub email has already been verified.
            </p>

            <p style="
                color:#555;
                line-height:1.7;
                font-size:16px;
            ">
                You can log in now and continue to create your profile.
            </p>

            <a
                href="https://bmtheaterhub.com/login.html"
                style="
                    display:inline-block;
                    margin-top:20px;
                    padding:14px 30px;
                    background:#5b3df5;
                    color:#fff;
                    text-decoration:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:bold;
                "
            >
                Go to Login
            </a>

          </div>

        </body>

       </html>
     `);
    }

        /*
        =========================================
        Verify User
        =========================================
        */

        user.emailVerified = true;

        /*
        -----------------------------------------
        Clear token immediately.
        This makes the verification link
        single-use.
        -----------------------------------------
        */

        user.emailVerificationToken = "";

        user.emailVerificationExpires = null;

        await user.save();

        /*
        =========================================
        Success Response
        =========================================
        */

        return res.status(200).send(`
        <!DOCTYPE html>
        <html>

        <head>
        <meta charset="UTF-8">

        <meta
            name="viewport"
            content="width=device-width,initial-scale=1.0"
        >

        <title>Email Verified</title>

        </head>

        <body style="
        margin:0;
        padding:40px 20px;
        background:#f4f6fb;
        font-family:Arial,Helvetica,sans-serif;
        text-align:center;
      ">

        <div style="
            max-width:500px;
            margin:60px auto;
            background:#fff;
            padding:40px 25px;
            border-radius:16px;
            box-shadow:0 8px 25px rgba(0,0,0,.08);
        ">

            <div style="
                font-size:55px;
                margin-bottom:15px;
            ">
                ✅
            </div>

            <h2 style="
                color:#28a745;
                margin-bottom:15px;
            ">
                Email Verified Successfully
            </h2>

            <p style="
                color:#555;
                line-height:1.7;
                font-size:16px;
            ">
                Your BMTheaterHub email has been verified successfully.
            </p>

            <p style="
                color:#555;
                line-height:1.7;
                font-size:16px;
            ">
                Your account is now ready.
                Please log in to continue and create your profile.
            </p>

            <a
                href="https://bmtheaterhub.com/login.html"
                style="
                    display:inline-block;
                    margin-top:20px;
                    padding:14px 30px;
                    background:#5b3df5;
                    color:#fff;
                    text-decoration:none;
                    border-radius:10px;
                    font-size:16px;
                    font-weight:bold;
                "
            >
                Go to Login
            </a>

        </div>

    </body>

    </html>
  `);

    } catch (error) {

        console.error(
            "Email Verification Error:",
            error
        );

        return res.status(500).send(`
            <!DOCTYPE html>
            <html>

            <head>
                <meta charset="UTF-8">
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1.0"
                >
                <title>Verification Error</title>
            </head>

            <body style="
                margin:0;
                padding:40px 20px;
                background:#f4f6fb;
                font-family:Arial,Helvetica,sans-serif;
                text-align:center;
            ">

                <div style="
                    max-width:500px;
                    margin:60px auto;
                    background:#fff;
                    padding:40px 25px;
                    border-radius:16px;
                ">

                    <h2 style="color:#d93025;">
                        Verification Failed
                    </h2>

                    <p style="color:#555;">
                        Something went wrong while verifying your email.
                        Please try again later.
                    </p>

                </div>

            </body>

            </html>
        `);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        // =========================================
        // EMAIL VERIFICATION SECURITY CHECK
        // =========================================

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                emailVerified: false,
                emailVerificationRequired: true,
                message:
                    "Please verify your email before logging in. Check your inbox for the verification link."
            });
        }

        // =========================================
        // CREATE JWT ONLY AFTER EMAIL VERIFICATION
        // =========================================

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

        return res.status(200).json({
            success: true,
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
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
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

    /* =========================================
        Password Changed Email
    ========================================= */

    try {

    await sendEmail({

        to: user.email,

        subject: "🔒 Your BMTheaterHub Password Has Been Changed",

        html: `
           <!DOCTYPE html>
           <html>
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
       🔒 Password Changed Successfully
       </h2>

       <p style="font-size:16px;color:#555;line-height:1.8;">

       Hello <strong>${user.name}</strong>,

       </p>

       <p style="font-size:16px;color:#555;line-height:1.8;">

        Your BMTheaterHub account password has been changed successfully.

       </p>

        <div style="
        background:#eafaf1;
        border-left:5px solid #28a745;
        padding:18px;
        border-radius:8px;
        font-size:15px;
        color:#444;
        margin:30px 0;
       ">

     ✅ Your account is now protected with the new password.

      </div>

      <div style="
      background:#fff4e5;
      border-left:5px solid #ff9800;
      padding:18px;
      border-radius:8px;
      font-size:15px;
      color:#555;
      ">

     If you did NOT change your password,
     please reset it immediately and contact our support team.

     </div>

     <div style="text-align:center;margin:35px 0;">

     <a
      href="https://bmtheaterhub.com/login.html"

      style="
      background:#5b3df5;
      color:#ffffff;
      padding:16px 34px;
      text-decoration:none;
      border-radius:8px;
      display:inline-block;
      font-weight:bold;">

     Login to BMTheaterHub

     </a>

      </div>

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

    catch(error){

    console.error("Password Changed Email Error:", error);

}

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