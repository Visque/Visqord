const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    friendOne: {
      type: String,
      required: true,
    },
    friendOne: {
      type: String,
      required: true,
    },
    invitedBy:{
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const friendModel = mongoose.model("friends", friendSchema);

module.exports = friendModel;
