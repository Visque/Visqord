const mongoose = require("mongoose");

const userChannelSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "channels",
      required: true,
    },
  },
  { timestamps: true }
);

const userChannelModel = mongoose.model("userChannels", userChannelSchema);

module.exports = userChannelModel;
