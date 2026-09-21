const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // =========================================
    // Email Verification
    // =========================================

    emailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: {
      type: String,
      default: ""
    },

    emailVerificationExpires: {
      type: Date,
      default: null
    },

    emailVerificationLastSentAt: {
      type: Date,
      default: null
    },

    emailVerificationSendCount: {
      type: Number,
      default: 0
    },

    // =========================================
    // Password Reset
    // =========================================

    resetPasswordToken: {
      type: String,
      default: ""
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    },

    // =========================================
    // User Role
    // =========================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);