'use strict'
//Variables
const express = require('express');
const bodyParser = require('body-parser');
const server = express();

//Routes
const equipmentRoutes = require('./routes/equipment.routes');
const userRoutes = require('./routes/user.routes');
const equipmentLoanRoutes = require('./routes/equipmentLoan.routes');

//Server configurations
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, X-Request-With, Content-Type,Accept, Access-Control-Allow, Request-Method')
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
    res.header('Access-Control-Allow-Headers','*');
    res.header('Access-Control-Allow-Credentials','true');
    res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//
server.use('/equipment', equipmentRoutes);
server.use('/user', userRoutes);
server.use('/equipmentLoan', equipmentLoanRoutes);
module.exports = server;