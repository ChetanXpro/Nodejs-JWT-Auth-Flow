const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    username: {
      type: String,

      require: true,
    },
    password: {
      type: String,

      require: true,
    },
    roles: [
      {
        type: String,
        default: "Employee",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    refresh:[String]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", schema);
