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
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    // x: {
    //   type: Array,
    //   of: mongoose.Schema.Types.ObjectId,
    //   ref: "users",
    // },
  },
  { timestamps: true }
);

const channelModel = mongoose.model("channels", channelSchema);

module.exports = channelModel;
