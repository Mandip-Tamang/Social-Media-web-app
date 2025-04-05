const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://mandipdimdum:tamang@cluster1.a2o8u.mongodb.net/"
);

const userSchema = new mongoose.Schema({
  // Added `new` for consistency
  name: { type: String },
  email: { type: String },
  password: { type: String },
  age: { type: Number },
  username: { type: String },
  profilepic: {
    type: String,
    default: "https://www.w3schools.com/howto/img_avatar.png",
  },
  post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("user", userSchema);
