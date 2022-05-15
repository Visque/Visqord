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
      required: false,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels",
      required: false,
    }
  },
  { timestamps: true }
);

const inviteNotifModel = mongoose.model("inviteNotifs", inviteNotifSchema);

module.exports = inviteNotifModel;
