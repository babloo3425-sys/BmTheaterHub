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
  },

    featured: {
    type: Boolean,
    default: false
  },

    verified: {
    type: Boolean,
    default: false
 },

  

    // ======================================
   //  Admin Block Status
   //  Used to hide/block an artist profile
   // ======================================
      blocked: {
      type: Boolean,
      default: false
},

    // ======================================
   // Profile Active Status
  // Admin can deactivate / activate artist
 // ======================================

    active: {

    type: Boolean,

    default: true

},

   // ======================================
  // Resume PDF
 // ======================================

    resume: {

    type: String,

    default: ""

 },

   // ======================================
  //   Performance Video
// ======================================

    performanceVideo: {

    type: String,

    default: ""

}

  },
 {
    timestamps: true
  }
 );

module.exports = mongoose.model("Profile", profileSchema);