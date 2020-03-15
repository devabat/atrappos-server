// /routes/pathRoute.js

const moment  = require('moment');

const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

// Load Path model
const Path = require("../models/Path");

module.exports = (app) => {
  const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  };

  app.use(allowCrossDomain);
// Bodyparser middleware
  app.get(`/api/paths`, async (req, res) => {
    try {
      const paths = await Path.find({});
      return res.status(200).send(paths);
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  app.get(`/api/path`, async (req, res) => {
    const id = req.query.id;
    try {
      const path = await Path.findById(id)
      return res.status(200).send(path);
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  app.post(`/api/path`, async (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middelware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
      //if can verify the token, set req.user and pass to next middleware
      const decoded = jwt.decode(token.replace("Bearer ", ""));
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime) {
        res.status(401).send("Unauthorized token");
      } else {
        let tmpPath = req.body;
        tmpPath.userId = decoded.id;
        tmpPath._id = mongoose.Types.ObjectId();
        let path = new Path(tmpPath);
        path.created = moment();
        path.edited = [];
        path.save(function (err, path) {
          if (err) return console.error(err);
          console.log(path.name + " saved to paths collection.");
          return res.status(201).send({
            error: false,
            path
          })
        });
      }
    } catch (ex) {
      //if invalid token
      res.status(400).send("Invalid token.");
    }
  });

  app.put(`/api/path`, async (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middleware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
      //if can verify the token, set req.user and pass to next middleware
      const decoded = jwt.decode(token.replace("Bearer ", ""));
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime) {
        res.status(401).send("Unauthorized token");
      } else {
        let path = req.body;
        const id = req.query.id;
        let edited = path.edited;
        edited.push(moment());
        path.edited = edited;
        if (!id) {
          res.status(400).send("Bad request");
        } else {
          Path.findByIdAndUpdate(id, {$set:path},function (err) {
            if (err) return console.error(err);
            console.log(path.name + " modified and saved to paths collection.");
            return res.status(201).send({
              error: false,
              path
            })
          });
        }
      }
    } catch (ex) {
      //if invalid token
      res.status(400).send("Invalid token.");
    }

  });



  // app.put(`/api/path/:id`, async (req, res) => {
  //   const {id} = req.params;
  //
  //   let path = await Path.findByIdAndUpdate(id, req.body);
  //
  //   return res.status(202).send({
  //     error: false,
  //     path
  //   })
  //
  // });

  app.delete(`/api/path`, async (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middleware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
      //if can verify the token, set req.user and pass to next middleware
      const decoded = jwt.decode(token.replace("Bearer ", ""));
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime) {
        res.status(401).send("Unauthorized token");
      } else {
        const id = req.query.id;
        if (!id) {
          res.status(400).send("Bad request");
        } else {
          Path.findByIdAndDelete(id,function (err) {
            if (err) return console.error(err);
            console.log("The path with id " + id + " was deleted from collection.");
            return res.status(201).send({
              error: false,
              id
            })
          });
        }
      }
    } catch (ex) {
      //if invalid token
      res.status(400).send("Invalid token.");
    }

  });

};