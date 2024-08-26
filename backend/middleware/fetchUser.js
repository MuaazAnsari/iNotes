const jwt = require("jsonwebtoken");
require("dotenv").config();

const fetchUser = (req, res, next) => {
  // Get the User from the auth token

  //get token from request header, ie auth token
  const token = req.header("auth-token");

  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token!" });
  }

  try {
        //verify the token
        const data = jwt.verify(token, process.env.JWT_SECRET);

        //add user into request
        req.user = data.user;
        next();

  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token!" });
  }
};

module.exports = fetchUser;
