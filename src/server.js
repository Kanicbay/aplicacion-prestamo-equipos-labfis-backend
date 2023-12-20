'use strict'
//Variables
const express = require('express');
const bodyParser = require('body-parser');
const server = express();

//Routes


//
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

//
module.exports = server;