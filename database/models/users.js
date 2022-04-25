const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: "India",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0,
      required: true,
    },
    channels: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "channels",
      required: true,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
