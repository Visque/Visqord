const mongoose = require("mongoose");

const inviteNotifSchema = new mongoose.Schema(
  {
    type: {
      type: Number,
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const inviteNotifModel = mongoose.model("inviteNotifs", inviteNotifSchema);

module.exports = inviteNotifModel;
