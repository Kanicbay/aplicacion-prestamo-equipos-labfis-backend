'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquipmentSchema = Schema({
    equipmentId: {
        type: String,
        required: true,
        unique: true,
    },
    assesmentCodes: [{
        assesmentCode: {
            type: String,
            required: false,
            unique: true,
        }
    }],
    /*
    actualAssesmentCode : {
        type: String,
        required: true,
        unique: true,
    },
    oldAssesmentCode : {
        type: String,
        required: false,
        unique: true,
    },
    */
    equipmentNumber : {
        type: String,
        required: false, 
    },
    model : {
        type: String,
        required: true,
    },
    category : {
        type: String,
        required: true,
    },
    photos: [{
        photo: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    }],
    description: {
        type: String,
        required: true,
    },
    qrCode: {
        type: String,
        required: false,
        default: '',
    },
    status: {
        type: String,
        default: 'available',
    },
});

module.exports = mongoose.model('Equipment', EquipmentSchema);