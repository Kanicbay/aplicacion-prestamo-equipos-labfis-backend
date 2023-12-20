'use strict'
const mongoose = require('mongoose');

if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

//Make the promise
mongoose.promise = global.Promise;
mongoose.set("strictQuery",false);
var server = require('./server.js');
var port = process.env.PORT || 3000;
var connection = "mongodb://127.0.0.1:27017/AppPrestamosLabFis";
console.log(connection);

//connect to DB
mongoose.connect(connection)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(port, () => {
      console.log("Server running on port " + port);
    });
  });