'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquipmentSchema = Schema({
    equipmentId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
    },
    assesmentCode: {
        type: String,
        required: true,
        unique: true,
    },
    previousCode: {
        type: String,
        required: false,
        unique: true,
    },
    serialNumber: {
        type: String,
        required: false,
        unique: true,
    },
    model: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    custodian: {
        type: String,
        required: true,
    },
    equipmentNumber: {
        type: String,
        required: false,
    },
    photos: [{
        _id: false,
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
    brand: {
        type: String,
        required: false,
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