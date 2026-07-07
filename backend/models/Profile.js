const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    profileType: {
      type: String,
      enum: [
        "Drama Artist",
        "Director",
        "Theatre Group",
        "Stage Decorator",
        "Sound Engineer",
        "Light Engineer",
        "Theatre Trainer"
      ],
      required: true
    },

    city: String,
    state: String,
    experience: String,
    about: String,
    whatsapp: String,

    profileImage: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);