const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No description...",
      required: false,
    },
    tags: {
      type: [String],
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

const channelModel = mongoose.model("channels", channelSchema);

module.exports = channelModel;
