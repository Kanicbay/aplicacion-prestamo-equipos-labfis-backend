'use strict'
//Variables
const express = require('express');
const bodyParser = require('body-parser');
const server = express();

//Routes
const equipmentRoutes = require('./routes/equipment.routes');


//Server configurations
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.use((req, res, next, err) => {
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    console.log(err);
    next();

});

//
server.use('/equipment', equipmentRoutes);
module.exports = server;