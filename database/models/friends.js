const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema(
  {
    friendOne: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    friendTwo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const friendModel = mongoose.model("friends", friendSchema);

module.exports = friendModel;
