'use strict'
var equipmentSchema = require('../models/equipment');
var qrCode = require('qrcode');
var fs = require('fs').promises;
var path = require('path');

var equipmentController = {
    // Add an equipment
    addEquipment: async function (req, res) {
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
            equipment.description = params.description;
            //equipment.status = params.status;

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

            //Generate the QR Code
            equipment.qrCode = await qrCode.toString(equipment._id.toHexString(),
                { type: 'svg', width: '200' },
                function (err, code) {
                    if (err) return res.status(500).send({
                        message: 'Error generating QR Code',
                        error: err
                    });
                    console.log(code)
                });

            //Save the equipment
            await equipment.save();

            return res.status(200).send({
                message: 'Equipment added successfully',
                equipment_id: equipment._id,
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error adding equipment',
                error: error
            });
        }
    },

    // Add an image to an equipment
    addImage: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;
            var fileName = "Imagen no subida";

            if (req.files) {
                var filePath = req.files.photo.path;
                var file_split = filePath.split('\\');
                var fileName = file_split[2];
                var extSplit = fileName.split('\.');
                var fileExt = extSplit[1];
                if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
                    const existingEquipment = await equipmentSchema.findById(equipmentId);
                    const oldImageFileName = existingEquipment.photo;
                    console.log("oldimage:"+oldImageFileName);

                    //Check if the equipment already exists
                    if (!existingEquipment) {
                        return res.status(409).send({
                            message: 'Equipment does not exists',
                        });
                    }

                    //Delete the old image
                    if (oldImageFileName != "") {
                        await fs.unlink('./src/images/' + oldImageFileName);
                    }

                    //Save the new image
                    await equipmentSchema.updateOne({ _id: equipmentId }, {
                        $set: {
                            photo: fileName,
                        }
                    });
                    return res.status(200).send({
                        message: 'Image added successfully',
                    });
                } else {
                    fs.unlink(filePath, (err) => {
                        return res.status(200).send({
                            message: 'Extension not valid',
                            error: err
                        });
                    });
                }

            } else {
                return res.status(200).send({ message: fileName });
            }
        } catch (error) {
            return res.status(500).send({
                message: 'Error adding image',
                error: error,
            });
        }
    },

    // Get an image from an equipment
    getImage: async function (req, res) {
        try {
            //Take Params
            const imageFile = req.params.imageFile;
            const pathFile = './src/images/' + imageFile;
            const stats = await fs.stat(pathFile);

            //Check if the image exists
            if (stats.isFile()) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                res.status(409).send({ message: "Image does not exists" })
            }

        } catch (error) {
            return res.status(500).send({
                message: 'Error getting image',
                error: error
            });
        }
    },

    // Get an equipment by id
    getEquipment: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findById(equipmentId);
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }
            return res.status(200).send({
                existingEquipment,
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error getting equipment',
                error: error
            });
        }
    },

    // Get all equipments
    getEquipments: async function (req, res) {
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
    updateEquipment: async function (req, res) {
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
            equipment.description = params.description;
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
                    //qrCode: equipment.qrCode,
                    description: equipment.description,
                    status: equipment.status,
                }
            });
            return res.status(200).send({
                message: 'Equipment modified successfully',
                equipment_id: existingEquipment._id,
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error modifying equipment',
                error: error
            });
        }
    },

    //Delete an equipment
    deleteEquipment: async function (req, res) {
        try {

            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            // and delete the equipment
            const deletedEquipment = await equipmentSchema.findById(equipmentId);
            if (!deletedEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            //Delete the image
            if (deletedEquipment.photo != '') {
                await fs.unlink('./src/images/' + deletedEquipment.photo);
            }

            await equipmentSchema.deleteOne({ _id: equipmentId });

            return res.status(200).send({
                message: 'Equipment deleted successfully',
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error deleting equipment',
                error: error
            });
        }
    }
}

module.exports = equipmentController;