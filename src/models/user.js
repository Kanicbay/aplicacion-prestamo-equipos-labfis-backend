'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
    fullName: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: false,
        default: '',
    
    },
    institucionalEmail : {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('User', UserSchema);