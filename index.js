const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/users");
const paths = require("./routes/paths");

const app = express();

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




// //  index.js
//
// const express = require('express');
// const mongoose = require('mongoose');
// const MongoClient = require('mongodb').MongoClient;
//
// // mongoose.set('debug', true);
//
// // IMPORT MODELS
// require('./models/Path');
//
//
// const app = express();
// mongoose.Promise = global.Promise;
// mongoose.connect((process.env.MONGODB_URI || `mongodb+srv://admin:pw@cluster-dxcpq.mongodb.net/dbProject?retryWrites=true&w=majority`), {useNewUrlParser: true,  useUnifiedTopology: true});
// const bodyParser = require('body-parser');
//
//
// app.use(bodyParser.json());
//
// //IMPORT ROUTES
// require('./routes/paths')(app);
//
//
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('../atrappos-client/build'));
//
//   const path = require('path');
//   app.get('*', (req,res) => {
//       res.sendFile(path.resolve(__dirname, '../atrappos-client', 'build', 'index.html'))
//   })
//
// }
//
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`app running on port ${PORT}`)
// });

