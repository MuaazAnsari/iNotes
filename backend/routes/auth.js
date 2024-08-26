const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fetchUser = require('../middleware/fetchUser');

// ROUTE 1 : Create a user by POST : /api/auth/createuser  "No login required"
// Using a validate array to validate the input request
router.post(
  "/createuser",
  [
    body("name", "name should be atleast 3 characters").isLength({ min: 3 }),
    body("email", "Must be a valid email").isEmail(),
    body("password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
  ],
  async (req, res, next) => {
    // If there are errors, return them
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      // If user with the same email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry , a user with this email already exists!" });
      }

      // password hashing using bcrypt
      const salt = await bcrypt.genSalt(10);
      const secretPass = await bcrypt.hash(req.body.password, salt);

      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secretPass,
      });

      // data in jwt payload, ie user_id
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, process.env.JWT_SECRET);

      // send auth token as response
      res.json({ authtoken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal Server error!");
    }
  }
);

// ROUTE 2 - Authenticate a user , by POST : /api/auth/login  "No login required"
router.post(
  "/login",
  [
    body("email", "Must be a valid email").isEmail(),
    body("password", "Password must be at least 3 characters long").isLength({
      min: 3,
    }),
  ],
  async (req, res, next) => {
    // If there are errors, return them
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
      const { email, password } = req.body;
      //find user
      let user = await User.findOne({ email });
      //if it doesnt exists
      if (!user) {
        return res.status(400).json({ error: "Try Again!" });
      }

      //compare password with bcrypt.compare
      const passCompare = await bcrypt.compare(password, user.password);

      //if passwords do not match
      if (!passCompare) {
        return res.status(400).json({ error: "Try Again!" });
      }

      // If they match, just sign jwt token and send it.
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, process.env.JWT_SECRET);

      // send auth token as response
      res.json({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error!");
    }
  }
);

// ROUTE -3  get logged in user details by POST : /api/auth/getuser  "login required"
router.post("/getuser", fetchUser, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      res.send(user);

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error!");
    }
  }
);

module.exports = router;
