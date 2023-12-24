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
    institutionalEmail : {
        type: String,
        required: true,
        unique: true,
    },
    identificationCard: {
        type: String,
        required: true,
        unique: true,
    },
    rol: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('User', UserSchema);