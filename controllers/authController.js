const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ----- FUNCTIONS -----
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let error = { email: "", password: "" };

  //duplicate email
  if (err.code == 11000) {
    error = { email: "Email already exists", password: "" };
  }

  //validation Errors
  else if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach((property) => {
      error[property.properties.path] = property.properties.message;
    });
  } else if (err.message === "Incorrect Email") {
    error.email = "that email is not registered";
  } else if (err.message === "Incorrect Password") {
    error.password = "that password is incorrect";
  }
  return error;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: maxAge,
  });
};

// ------- END-POINTS -------

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    // user creation
    const user = await User.create({
      email,
      password,
    });

    // Token
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    // response
    res.status(201).json({ user: user._id });
  } catch (err) {
    // console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
