'use strict'
const e = require('express');
var equipmentSchema = require('../models/equipment');

var controller = {
    // Add an equipment
    addEquipment: async function(req, res) {
        try {
            //Take Params
            var equipment = new equipmentSchema();
            var params = req.body;
            equipment.equipmentCode = params.equipmentCode;
            equipment.actualAssesmentCode = params.actualAssesmentCode;
            equipment.oldAssesmentCode = params.oldAssesmentCode;
            equipment.equipmentNumber = params.equipmentNumber;
            equipment.model = params.model;
            equipment.category = params.category;
            equipment.qrCode = params.qrCode;
            equipment.status = params.status;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({
                $or: [
                    { actualAssesmentCode: equipment.actualAssesmentCode },
                    { oldAssesmentCode: equipment.oldAssesmentCode },
                ]
            });
            if (existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment already exists',
                });
            }

            //Save the equipment
            await equipment.save();
            return res.status(200).send({
                message: 'Equipment added successfully',
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error adding equipment',
                error: error
            });
        }
    },

    // Get all equipments
    getEquipments: async function(req, res) {
        try {
            //Get all equipments
            const equipments = await equipmentSchema.find({});
            return res.status(200).send({
                equipments,
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error getting equipments',
                error: error
            });
        }
    },

    //Modify an equipment
    modifyEquipment: async function(req, res) {
        try {
            //Take Params
            var equipment = new equipmentSchema();
            var params = req.body;
            equipment.equipmentCode = params.equipmentCode;
            equipment.actualAssesmentCode = params.actualAssesmentCode;
            equipment.oldAssesmentCode = params.oldAssesmentCode;
            equipment.equipmentNumber = params.equipmentNumber;
            equipment.model = params.model;
            equipment.category = params.category;
            equipment.qrCode = params.qrCode;
            equipment.status = params.status;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({
                $or: [
                    { actualAssesmentCode: equipment.actualAssesmentCode },
                    { oldAssesmentCode: equipment.oldAssesmentCode },
                ]
            });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            //Modify the equipment
            await equipmentSchema.updateOne({ actualAssesmentCode: equipment.actualAssesmentCode }, {
                $set: {
                    equipmentCode: equipment.equipmentCode,
                    equipmentNumber: equipment.equipmentNumber,
                    model: equipment.model,
                    category: equipment.category,
                    qrCode: equipment.qrCode,
                    status: equipment.status,
                }
            });
            return res.status(200).send({
                message: 'Equipment modified successfully',
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error modifying equipment',
                error: error
            });
        }
    },
}

module.exports = controller;