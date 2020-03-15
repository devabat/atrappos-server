const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");
const validateResetInput = require("../validation/reset");

// Load User model
const User = require("../models/User");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
      hashPassword(newUser, res)
    }
  });
});

// @route POST api/users/update
// @desc Update user
// @access Private
router.post("/update", (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).send("Access denied. No token provided.");

    try {
        //if can verify the token, set req.user and pass to next middleware
        const decoded = jwt.decode(token.replace("Bearer ",""));
        const currentTime = Date.now() / 1000; // to get in milliseconds
        if (decoded.exp < currentTime) {
            res.status(401).send("Unauthorized token");
        } else {
            const name = req.query.name;
            const type = req.query.updateType;
            const newPath = req.query.newPath;

            if (type === 'create') {
                User.findOne({ name }).then(user => {
                    // Check if user exists
                    if (!user) {
                        return res.status(404).json({namenotfound: "Name not found"});
                    } else {
                        user.paths = user.paths.push(newPath);
                        console.log(user.paths)
                        user
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    }
                });
            } else {

            }

        }
    } catch (ex) {
        //if invalid token
        res.status(400).send("Invalid token.");
    }
});


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
          paths: user.paths

        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926 // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

// @route POST api/users/reset
// @desc Reset user password
// @access Private
router.post("/reset", (req, res) => {
    // Form validation

    const { errors, isValid } = validateResetInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    User.findOne({email: email, password: password}, function(err, user){
        // Check if user exists
        if (!user) {
            return res.status(404).json({emailnotfound: "Email not found"});
        }
        user.password = newPassword;
        hashPassword(user, res);
    });
});

function hashPassword (user, res) {
    // Hash password before saving in database
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
                .save()
                .then(user => res.json(user))
                .catch(err => console.log(err));
        });
    });
}

module.exports = router;
