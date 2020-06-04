// /routes/pathRoute.js

const moment  = require('moment');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load Path model
const Path = require("../models/Path");

const device = require('express-device');

const request = require('request-promise');

module.exports = (app) => {
  app.use(device.capture());
// Bodyparser middleware
  app.get(`/api/paths`, async (req, res) => {
    try {
      const paths = await Path.find({});
      return res.status(200).send(paths);
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });
  app.get(`/api/paths/desktop`, async (req, res) => {
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
        try {
          const pipeline = {$match:{"device":"desktop"}}
          return Path.aggregate([pipeline])
              .then(desktopPaths => {
                console.log("All desktop paths fetched successfully");
                return res.status(200).send(desktopPaths);
              })
              .catch(err =>  res.status(500).json({ message: err.message }))
        } catch (err) {
          return res.status(500).json({ message: err.message })
        }
      }
    } catch (ex) {
      //if invalid token
      res.status(400).send("Invalid token.");
    }
  });

  app.get(`/api/paths/mobile`, async (req, res) => {
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
        try {
          const pipeline = {$match:{"device":"phone"}}
          return Path.aggregate([pipeline])
              .then(desktopPaths => {
                console.log("All desktop paths fetched successfully");
                return res.status(200).send(desktopPaths);
              })
              .catch(err =>  res.status(500).json({ message: err.message }))
        } catch (err) {
          return res.status(500).json({ message: err.message })
        }
      }
    } catch (ex) {
      //if invalid token
      res.status(400).send("Invalid token.");
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
        // tmpPath.userName = decoded.name;
        tmpPath._id = mongoose.Types.ObjectId();
        let device = req.device.type;
        let path = new Path(tmpPath);
        path.created = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        path.modified = [];
        path.device = device;
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
        let modified = path.modified;
        modified.push(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'));
        path.modified = modified;
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

  app.get(`/api/path/snap`, async (req, res) => {
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
        const coords = req.query.coords;
        const radius = req.query.radius;
        const token = process.env.MAPBOX_ACCESS_TOKEN;
        const query = 'https://api.mapbox.com/matching/v5/mapbox/walking' +
            '/' + coords + '?geometries=geojson&radiuses=' + radius +
            '&steps=false&access_token=' + token;
        const options = {
          method: 'GET',
          uri: query,
          toJSON: true
        }

        request(options).then(function (response){
          console.log('snap response', response)
          let resp = JSON.parse(response).matchings[0].geometry.coordinates;
          return res.status(200).json(resp);
        })
            .catch(function (err) {
              console.log('snap ERROR', err);
            })
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

  // CHARTS

  // Draw Duration
  app.get(`/api/paths/chart/draw/duration`, async (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middleware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
      //if can verify the token, set req.user and pass to next middleware
      const decoded = jwt.decode(token.replace("Bearer ", ""));
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime || decoded.role !== 'admin') {
        res.status(401).send("Unauthorized token");
      } else {
        const paths = await Path.find({});
        let data = paths.map((p) => ({drawType: camelSentence(p.drawType), drawDuration: p.drawn.duration})).sort(compareDrawType);
        return res.status(200).send(data);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Edits
  app.get(`/api/paths/chart/edit/count`, async (req, res) => {
    //get the token from the header if present
    const token = req.headers["x-access-token"] || req.headers["authorization"];
    //if no token found, return response (without going to the next middleware)
    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
      //if can verify the token, set req.user and pass to next middleware
      const decoded = jwt.decode(token.replace("Bearer ", ""));
      const currentTime = Date.now() / 1000; // to get in milliseconds
      if (decoded.exp < currentTime || decoded.role !== 'admin') {
        res.status(401).send("Unauthorized token");
      } else {
        const paths = await Path.find({});
        let data = paths.map((p)=>
            ({drawType: camelSentence(p.drawType),
              beforeSave: p.edited.filter((ed)=> ed.state === 'beforeSave').length,
              afterSave: p.edited.filter((ed)=> ed.state === 'afterSave').length,
            }));

        const result = Object.values(data.reduce((e, o) => (e[o.drawType]
            ? (e[o.drawType].beforeSave += o.beforeSave,
                e[o.drawType].afterSave += o.afterSave)
            : (e[o.drawType] = {...o}), e), {})).sort(compareDrawType);

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

};

function camelSentence(str) {
  return  (" " + str).toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr)
  {
    return chr.toUpperCase();
  });
}

function compareDrawType( a, b ) {
  if (((a.drawType).toLowerCase() === "desktop" && (b.drawType).toLowerCase() === "location") ||
      ((a.drawType).toLowerCase() === "phone" && (b.drawType).toLowerCase() === "location") ||
      ((a.drawType).toLowerCase() === "desktop" && (b.drawType).toLowerCase() === "phone"))
  {
    return -1;
  }
  if (((a.drawType).toLowerCase() === "location" && (b.drawType).toLowerCase() === "desktop") ||
      ((a.drawType).toLowerCase() === "location" && (b.drawType).toLowerCase() === "phone") ||
      ((a.drawType).toLowerCase() === "phone" && (b.drawType).toLowerCase() === "desktop")) {
    return 1;
  }
  return 0;
}
