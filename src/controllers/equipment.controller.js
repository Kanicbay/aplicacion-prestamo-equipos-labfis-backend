'use strict'
var equipmentSchema = require('../models/equipment');
var fs = require('fs').promises;
var qrCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const formidable = require('formidable');

var equipmentController = {
    
    addEquipment: async function (req, res) {
        // Declare equipment and form instance
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            try {

                //Verify if all the photos from files are in the correct format
                for (let i = 0; i < files.equipmentPictures.length; i++) {
                    if (files.equipmentPictures[i].mimetype != 'image/jpeg' && files.equipmentPictures[i].mimetype != 'image/png' && files.equipmentPictures[i].mimetype != 'image/jpg') {
                        return res.status(409).send({
                            message: 'Image format not supported',
                        });
                    }
                }

                // Get the first element of each field (as only one is expected) 
                // field code can change for an array of values
                const params = {};
                Object.keys(fields).forEach(key => {
                    params[key] = fields[key][0];
                });
        
                // Save params in equipment object 
                var equipment = new equipmentSchema();
                equipment.equipmentId = uuidv4();
                equipment.equipmentNumber = params.equipmentNumber;
                equipment.model = params.model;
                equipment.category = params.category;
                equipment.description = params.description;

                //Save the assesment codes
                params.assesmentCodes = params.assesmentCodes.split(',').map(codigo => ({ assesmentCode: codigo.trim() }));
                equipment.assesmentCodes = params.assesmentCodes;
        
                //Check if the equipment already exists using assesmentCodes array
                const existingEquipment = await equipmentSchema.findOne({
                    'assesmentCodes.assesmentCode': {
                        $in: params.assesmentCodes.map(item => item.assesmentCode)
                    }
                });
                
                if (existingEquipment) {
                    return res.status(409).send({
                        message: 'Equipment already exists',
                    });
                }

                //Generate the QR Code
                equipment.qrCode = qrCode.toString(equipment._id.toHexString(),
                { type: 'svg', width: '200' },
                function (err, code) {
                    if (err) return res.status(500).send({
                        message: 'Error generating QR Code',
                        error: err
                    });
                });

                //Read all the images files ans save it as a base64 string each one into the array photos in equipment
                equipment.photos = [];
                for (let i = 0; i < files.equipmentPictures.length; i++) {
                    const imageBuffer = await fs.readFile(files.equipmentPictures[i].filepath);
                    const imageBase64 = imageBuffer.toString('base64');
                    equipment.photos.push({
                        photo: imageBase64,
                        name: files.equipmentPictures[i].originalFilename,
                        type: files.equipmentPictures[i].mimetype,
                    });
                }

                //Save the equipment
                await equipment.save();

                //Finish the request
                return res.status(200).send({
                    message: 'Equipment added successfully'
                });
            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    message: 'Error adding equipment',
                    error: error
                });
            }
        });
    },

    // Get an equipment by id
    getEquipment: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            // Remove the photo from the equipment object query
            const {_id, ...existingEquipmentWithoutId } = existingEquipment.toObject();
            
            // Remove photo information and type from each photo
            const photosWithoutDetails = existingEquipmentWithoutId.photos.map(({ photo, type, _id, ...rest }) => rest);

            return res.status(200).send({
                equipment: {
                    ...existingEquipmentWithoutId,
                    photos: photosWithoutDetails,
                
                },
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error getting equipment',
                error: error
            });
        }
    },

    // Get an equipment photo by id
    getEquipmentPhoto: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Take query
            const photoName = req.query.name;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            //Check if the photo exists
            const existingPhoto = existingEquipment.photos.find(photo => photo.name == photoName);

            if (!existingPhoto) {
                return res.status(409).send({
                    message: 'Photo does not exists',
                });
            }

            //Decode the found image
            const imageBuffer = Buffer.from(existingPhoto.photo, 'base64');

            res.setHeader('Content-Type', existingPhoto.type);

            return res.status(200).send(imageBuffer);
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

            // Remove photos and equipment id from each equipment
            const equipmentsWithoutDetails = equipments.map(equipment => {
                const { _id, ...equipmentWithoutDetails } = equipment.toObject();
            
                // Take just the photo name from each photo in the equipment
                const photosWithoutDetails = equipmentWithoutDetails.photos.map(({ photo, type, _id, ...rest }) => rest);

                return {
                    ...equipmentWithoutDetails,
                    photos: photosWithoutDetails,
                };
            });

            return res.status(200).send({
                equipments: equipmentsWithoutDetails,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: 'Error getting equipments',
                error: error
            });
        }
    },

    updateEquipment: async function (req, res) {
        // Declare equipment and form instance
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            try {
                //Verify if all the photos from files are in the correct format
                for (let i = 0; i < files.equipmentPictures.length; i++) {
                    if (files.equipmentPictures[i].mimetype != 'image/jpeg' && files.equipmentPictures[i].mimetype != 'image/png' && files.equipmentPictures[i].mimetype != 'image/jpg') {
                        return res.status(409).send({
                            message: 'Image format not supported',
                        });
                    }
                }

                // Get the first element of each field (as only one is expected) 
                // field code can change for an array of values
                const params = {};
                Object.keys(fields).forEach(key => {
                    params[key] = fields[key][0];
                });

                //Take equipmet id
                var equipmentCode = req.params.id;
        
                //Check if the equipment exists
                const existingEquipment = await equipmentSchema.findOne({equipmentId: equipmentCode});
                if (!existingEquipment) {
                    return res.status(409).send({
                        message: 'Equipment does not exist',
                    });
                }

                // Save params in equipment object 
                
                var updateQRCode = params.updateQRCode;
                existingEquipment.actualAssesmentCode = params.actualAssesmentCode;
                existingEquipment.oldAssesmentCode = params.oldAssesmentCode;
                existingEquipment.equipmentNumber = params.equipmentNumber;
                existingEquipment.model = params.model;
                existingEquipment.category = params.category;
                existingEquipment.description = params.description;
                existingEquipment.status = params.status;

                //Verifiy it needs to generate the qr code again
                if(updateQRCode){
                    //Generate the QR Code
                    existingEquipment.qrCode = qrCode.toString(existingEquipment._id.toHexString(),
                    { type: 'svg', width: '200' },
                    function (err, code) {
                        if (err) return res.status(500).send({
                            message: 'Error generating QR Code',
                            error: err
                        });
                    });
                }
                

                //Read all the images files ans save it as a base64 string each one into the array photos in equipment
                existingEquipment.photos = [];
                for (let i = 0; i < files.equipmentPictures.length; i++) {
                    const imageBuffer = await fs.readFile(files.equipmentPictures[i].filepath);
                    const imageBase64 = imageBuffer.toString('base64');
                    existingEquipment.photos.push({
                        photo: imageBase64,
                        name: files.equipmentPictures[i].originalFilename,
                        type: files.equipmentPictures[i].mimetype,
                    });
                }

                //Modify the equipment
                await equipmentSchema.updateOne({ equipmentId: equipmentCode }, {
                    $set: existingEquipment
                });
                return res.status(200).send({
                    message: 'Equipment modified successfully'
                });
            } catch (error) {
                console.log(error);
                return res.status(500).send({
                    message: 'Error adding equipment',
                    error: error
                });
            }
        });
    },

    //Delete an equipment
    deleteEquipment: async function (req, res) {
        try {

            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            // and delete the equipment
            const deletedEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId});
            if (!deletedEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            await equipmentSchema.deleteOne({ equipmentId: equipmentId });

            return res.status(200).send({
                message: 'Equipment deleted successfully',
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error deleting equipment',
            });
        }
    }
}

module.exports = equipmentController;