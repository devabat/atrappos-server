// /routes/pathRoute.js


const moment  = require('moment');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load Path model
const Path = require("../models/Path");

// Load User model
const User = require("../models/User");

const device = require('express-device');

const request = require('request-promise');

module.exports = (app) => {
  app.use(device.capture());
// Bodyparser middleware
  app.get(`/api/paths`, async (req, res) => {
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
            const paths = await Path.find({});
            return res.status(200).send(paths);
          } catch (err) {
            return res.status(500).json({message: err.message})
          }
        }
      } catch (ex) {
        //if invalid token
        res.status(400).send("Invalid token.");
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
      let path = req.body;
      if (decoded.exp < currentTime) {
        res.status(401).send("Unauthorized token");
      } else if (decoded.id !== path.userId) {
        res.status(401).send("Unauthorized access");
      } else {
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

        let data = paths.map((p)=>
            ({drawType: camelSentence(p.drawType),
              drawDuration: [p.drawn.duration]
            }));

        let result = Object.values(data.reduce((e, o) => (e[o.drawType]
            ? (e[o.drawType].drawDuration = e[o.drawType].drawDuration.concat(o.drawDuration))
            : (e[o.drawType] = {...o}), e), {})).sort(compareDrawType).map((r)=> {
          return {drawType: r.drawType, drawDuration: (r.drawDuration.reduce( ( p, c ) => p + c, 0 ) / r.drawDuration.length / 60).toFixed(2)}
        })
        // let data = paths.map((p) => ({drawType: camelSentence(p.drawType), drawDuration: p.drawn.duration})).sort(compareDrawType);

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Edit Count
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

        let result = Object.values(data.reduce((e, o) => (e[o.drawType]
            ? (e[o.drawType].beforeSave += o.beforeSave,
                e[o.drawType].afterSave += o.afterSave)
            : (e[o.drawType] = {...o}), e), {})).sort(compareDrawType);

        result = result.filter(function( obj ) {
          return obj.drawType !== 'Location';
        });

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Edit Duration
  app.get(`/api/paths/chart/edit/duration`, async (req, res) => {
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
            (p.edited.length > 0 && p.drawType !== 'location' ? {drawType: camelSentence(p.drawType),
              editDuration: p.edited.map((e) => e.duration)
            }: null)).filter(d => d !== null);

        let result = Object.values(data.reduce((e, o) => (e[o.drawType]
            ? (e[o.drawType].editDuration = e[o.drawType].editDuration.concat(o.editDuration))
            : (e[o.drawType] = {...o}), e), {})).sort(compareDrawType).map((r)=> {
          return {drawType: r.drawType, editDuration: (r.editDuration.reduce( ( p, c ) => p + c, 0 ) / r.editDuration.length / 60).toFixed(2)}
        })
        
        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });
  // Evaluation Count
  app.get(`/api/paths/chart/evaluation/count`, async (req, res) => {
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
              beforeDraw: p.evaluations.filter((ed)=> ed.state === 'beforeDraw').length,
              afterDraw: p.evaluations.filter((ed)=> ed.state === 'afterDraw').length,
              afterSave: p.evaluations.filter((ed)=> ed.state === 'afterSave').length,
            }));

        let result = Object.values(data.reduce((e, o) => (e[o.drawType]
            ? (e[o.drawType].beforeDraw += o.beforeDraw,
                e[o.drawType].afterDraw += o.afterDraw,
                e[o.drawType].afterSave += o.afterSave)

            : (e[o.drawType] = {...o}), e), {})).sort(compareDrawType);

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Evaluation per Path
  app.get(`/api/paths/chart/evaluation/per/path`, async (req, res) => {
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
        const subjectiveTypes = {
          '#12C416': 5,
          '#3D7AF5': 4,
          '#B054F8': 3,
          '#F27418': 2,
          '#F41A1A': 1
        };

        const objectiveTypesKeyValue = {
          5: {label:'Excellent'},
          4: {label:'Very Good'},
          3: {label:'Decent'},
          2: {label:'Not so Good'},
          1: {label:'Poor'}
        }

        const subjectiveTypesKeyValue = {
          5: {label: 'Magnificent'},
          4: {label: 'Very Pleasing'},
          3: {label: 'Fair'},
          2: {label: 'Not so Pleasing'},
          1: {label: 'Unpleasant'}
        };

        let filterData = paths.map((p)=> {
          return { objective: parseInt(p.properties.objective) / 2, subjective: subjectiveTypes[p.properties.subjective]}
        });

        let resData = [];
        for (let i=0; i<5; i++) {
          resData.push({
            x: i + 1,
            ay: 1,
            by: 2,
            cy: 3,
            dy: 4,
            ey: 5,
            xValueLabel: subjectiveTypesKeyValue[i + 1].label,
            aValue: filterData.filter((f)=> {return f.subjective ===  i + 1 && f.objective === 1}).length,
            aValueLabel: objectiveTypesKeyValue[1].label,
            bValue: filterData.filter((f)=> {return f.subjective ===  i + 1 && f.objective === 2}).length,
            bValueLabel: objectiveTypesKeyValue[2].label,
            cValue: filterData.filter((f)=> {return f.subjective ===  i + 1 && f.objective === 3}).length,
            cValueLabel: objectiveTypesKeyValue[3].label,
            dValue: filterData.filter((f)=> {return f.subjective ===  i + 1 && f.objective === 4}).length,
            dValueLabel: objectiveTypesKeyValue[4].label,
            eValue: filterData.filter((f)=> {return f.subjective ===  i + 1 && f.objective === 5}).length,
            eValueLabel: objectiveTypesKeyValue[5].label
          })
        }
        return res.status(200).send(resData);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Draw Type Count Per User
  app.get(`/api/paths/chart/draw/types/count/per/user`, async (req, res) => {
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
        const users = await User.find({});
        let data = groupByUser(paths, 'userId');
        let result = Object.keys(data).map((usrId, idx) =>
          (data[usrId].length > 0 ?  {
            user: 'usr' + (idx + 1).toString(),
            // user: users.find(u => u.id === usrId).name,
            desktop: data[usrId].filter((p)=> p.drawType === 'desktop').length,
            phone: data[usrId].filter((p)=> p.drawType === 'phone').length,
            location: data[usrId].filter((p)=> p.drawType === 'location').length
          }:null)).filter(d => d !== null);

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Draw Type Total Count
  app.get(`/api/paths/chart/draw/types/total/count`, async (req, res) => {
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
        let desktopPaths  = paths.filter((obj) => obj.drawType === 'desktop').length;
        let phonePaths  = paths.filter((obj) => obj.drawType === 'phone').length;
        let locationPaths = paths.filter((obj) => obj.drawType === 'location').length;

        let result = [
          {drawType: 'Desktop',
            paths: desktopPaths
          },
          {drawType: 'Phone',
            paths: phonePaths
          },
          {drawType: 'Location',
            paths: locationPaths
          }
        ];
        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Draw Type Count Per User
  app.get(`/api/paths/chart/draw/types/distance/per/user`, async (req, res) => {
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
        const users = await User.find({});
        let data = groupByUser(paths, 'userId');

        let result = Object.keys(data).map((usrId, idx) =>
            (data[usrId].length > 0 ?  {
              user: 'usr' + (idx + 1).toString(),
              // user: users.find(u => u.id === usrId).name,
              desktop: parseFloat((data[usrId].filter((p)=> p.drawType === 'desktop').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2)),
              phone: parseFloat((data[usrId].filter((p)=> p.drawType === 'phone').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2)),
              location: parseFloat((data[usrId].filter((p)=> p.drawType === 'location').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2))
            }:null)).filter(d => d !== null);

        return res.status(200).send(result);
      }
    } catch (err) {
      return res.status(500).json({ message: err.message })
    }
  });

  // Draw Type Total Distance
  app.get(`/api/paths/chart/draw/types/total/distance`, async (req, res) => {
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
        let desktopTotalDistance  = parseFloat((paths.filter((p)=> p.drawType === 'desktop').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2));
        let phoneTotalDistance  = parseFloat((paths.filter((p)=> p.drawType === 'phone').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2));
        let locationTotalDistance = parseFloat((paths.filter((p)=> p.drawType === 'location').reduce((a, b) => +a + +b.distance, 0) / 1000).toFixed(2));

        let result = [
          {drawType: 'Desktop',
            distance: desktopTotalDistance
          },
          {drawType: 'Phone',
            distance: phoneTotalDistance
          },
          {drawType: 'Location',
            distance: locationTotalDistance
          }
        ];
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

function groupByUser(items, key) {
  return items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [
          ...(result[item[key]] || []),
          item,
        ],
      }),
      {},
  );
}