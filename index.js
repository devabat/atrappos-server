const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/users");

const app = express();

const allowCrossDomain = function(req, res, next) {
    let allowedOrigins = [process.env.CLIENT_URL, process.env.MOB_CLIENT_URL];
    let origin = '';
    if (process.env.NODE_ENV === 'production' && allowedOrigins.includes(req.headers.origin)) {
        origin = req.headers.origin
    }
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Access-Token');
    next();
};

app.use(allowCrossDomain);

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
      extended: false
    })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Path model
require('./models/Path');

// Routes
app.use("/api/users", users);

require('./routes/paths')(app);


const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));

