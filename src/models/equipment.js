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
        //unique: true,
    },
    previousCode: {
        type: String,
        required: false,
        default: '',
        //unique: this.previousCode === "" ? false : true,
    },
    serialNumber: {
        type: String,
        required: false,
        unique: this.serialNumber === "" ? false : true,
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
            required: false,
        },
        name: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: false,
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
        unique: true,
    },
    status: {
        type: String,
        default: 'disponible',
    },
});

module.exports = mongoose.model('Equipment', EquipmentSchema);