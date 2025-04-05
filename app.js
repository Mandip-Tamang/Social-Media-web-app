const express = require("express");
const app = express();
const parser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/userModel");
const postModel = require("./models/postModel");
const upload = require("./utils/configmulter");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.json());
app.use("/images", express.static("/tmp"));
app.use(express.urlencoded({ extended: true }));
app.use(parser());

app.get("/profile/update", isLoggedin, (req, res) => {
  res.render("upload");
});

app.post(
  "/uploadFile",
  isLoggedin,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded or invalid file type."); //
    }
    // Update user's profile picture
    let user = await userModel.findOneAndUpdate(
      //npx nodemon SocialMediaProject/app.js
      { email: req.user.email },
      { profilepic: req.file.filename },
      { new: true }
    );
    res.redirect("/profile");
  }
);

// / -> home route
app.get("/", (req, res) => {
  res.send("This is running");
});
app.get("/register", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
//dynamic route for editing post by logged user
app.get("/edit/:postId", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.postId });
  res.render("editpost", { post });
});

app.get("/profile", isLoggedin, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("post");
  res.render("profile", { user });
});

// it display the all the post posted till now
app.get("/allposts", isLoggedin, async (req, res) => {
  let allPostsData = await postModel.find().populate("post");
  allPostsData.forEach((post) => {
    console.log(post.post?.username);
  });

  res.render("allposts", { allPostsData });
});

// this post route manages posting content
app.post("/post", isLoggedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.create({
    post: user._id,
    contents: req.body.contents,
  });
  user.post.push(post._id);
  await user.save();
  res.redirect("/profile");
});

//checks the like array from the post model and if the user is already liked then it removes the like from the array
app.get("/like/:postId", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.postId });
  if (post.likes.includes(req.user.userid)) {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  } else {
    post.likes.push(req.user.userid);
  }
  await post.save();
  res.redirect("/allposts");
});

// handles the update of the post using dynamic route
app.post("/update/:postId", isLoggedin, async (req, res) => {
  //npx nodemon SocialMediaProject/app.js
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.postId },
    { contents: req.body.newpost }
  );
  await post.save();
  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  try {
    let { username, email, password, age } = req.body;

    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).send("Already registered");
    }

    let salt = await bcrypt.genSalt(10); // Added await
    let hash = await bcrypt.hash(password, salt); // Added await

    let userData = await userModel.create({
      username,
      email,
      age,
      password: hash,
    });

    let token = jwt.sign({ email, userid: userData._id }, "secret");
    res.cookie("token", token);
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send(error.message); // Better error handling
  }
});
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send("Something went wrong");
    }

    let token = jwt.sign({ email, userid: user._id }, "secret");
    res.cookie("token", token);

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) res.redirect("profile");
      else res.redirect("/register");
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

// protected middlewares for checking that checks the token and if it is valid then it will allow the user to access the route
function isLoggedin(req, res, next) {
  if (!req.cookies?.token) {
    res.redirect("/login");
  } else {
    req.user = jwt.verify(req.cookies.token, "secret");
    next();
  }
}

app.listen(3000, (err) => {
  console.log("Running in port 3000");
});
