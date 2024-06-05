'use strict'
var equipmentSchema = require('../models/equipment');
var fs = require('fs').promises;
const sharp = require('sharp');
var qrCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');

const formidable = require('formidable');
const equipment = require('../models/equipment');
const e = require('express');

var equipmentController = {

    // Add an equipment or equipments with an excel file
    addEquipmentExcel: async function (req, res) {
        const form = new formidable.IncomingForm();
        try {
            form.on('file', async function (name, file) {
                try {
                    // Check if the file is an excel file
                    if (file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                        return res.status(409).send({
                            message: 'Formato de archivo no soportado', //File format not supported
                        });
                    }

                    // Read Excel file and save the params in an array
                    const workbook = xlsx.readFile(file.filepath);
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const params = xlsx.utils.sheet_to_json(sheet);
                    const saveEquipment = { saveCount: 0 };

                    // Save each equipment in the database
                    for (let i = 0; i < params.length; i++) {
                        try {

                            var equipment = new equipmentSchema();
                            equipment.equipmentId = uuidv4();
                            equipment.name = params[i].name;
                            equipment.category = params[i].category;
                            equipment.subCategory = params[i].subCategory;
                            equipment.assesmentCode = params[i].assesmentCode;
                            equipment.previousCode = params[i].previousCode;
                            equipment.serialNumber = params[i].serialNumber;
                            equipment.model = params[i].model;
                            equipment.description = params[i].description;
                            equipment.custodian = params[i].custodian;
                            equipment.equipmentNumber = params[i].equipmentNumber;
                            equipment.brand = params[i].brand;

                            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipment.equipmentId });

                            if (existingEquipment) {
                                return res.status(409).send({
                                    message: 'El Equipo ya existe', //Equipment already exists
                                });
                            }

                            //Generate the QR Code
                            equipment.qrCode = qrCode.toString(equipment._id.toHexString(),
                                { type: 'svg', width: '200' },
                                function (err, code) {
                                    if (err) return res.status(500).send({
                                        message: 'Error generando el código QR', //Error generating QR Code
                                        error: err
                                    });
                                });

                            //Add the equipment
                            await equipment.save();
                            if (equipment.save != null) {
                                saveEquipment.saveCount += 1;
                            }

                            //Finish the request
                            if (i == params.length - 1 && res.statusCode != 500 && res.statusCode != 409) {
                                res.status(200).send({
                                    message: 'Equipos agregados exitosamente' //Equipments added successfully
                                });
                            }

                        } catch (error) {
                            if (saveEquipment.saveCount != 0) {
                                res.status(500).send({
                                    message: 'Error agregando el equipo con codigo: ' + params[i].assesmentCode +
                                        ' todos los anteriores fueron agregados correctamente ('
                                        + saveEquipment.saveCount + ')', //Error adding equipment params[i].assesmentCode
                                    error: error
                                });
                            }
                            else {
                                res.status(500).send({
                                    message: 'Error agregando el equipo con codigo: ' + params[i].assesmentCode, //Error adding equipment params[i].assesmentCode
                                    error: error
                                });
                            }
                            break;
                        }

                    };

                } catch (error) {
                    console.log(error);
                    res.status(500).send({
                        message: 'Error leyendo el archivo excel', //Error read excel file
                        error: error
                    });
                }
            });

            form.parse(req);
            return;

        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: 'Error leyendo el archivo', //Error read file
                error: error
            });
        }
    },

    // Add an equipment
    addEquipment: async function (req, res) {
        // Declare equipment and form instance
        //const form = new formidable.IncomingForm();
        try {
            var equipment = new equipmentSchema();
            var params = req.body;
            equipment.equipmentId = uuidv4();
            equipment.name = params.name;
            equipment.category = params.category;
            equipment.subCategory = params.subCategory;
            equipment.assesmentCode = params.assesmentCode;
            equipment.previousCode = params.previousCode;
            equipment.serialNumber = params.serialNumber;
            equipment.model = params.model;
            equipment.description = params.description;
            equipment.custodian = params.custodian;
            equipment.equipmentNumber = params.equipmentNumber;
            equipment.brand = params.brand;

            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipment.equipmentId });

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
        /*form.parse(req, async (err, fields, files) => {
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
                equipment.name = params.name;
                equipment.category = params.category;
                equipment.subCategory = params.subCategory;
                equipment.assesmentCode = params.assesmentCode;
                equipment.previousCode = params.previousCode;
                equipment.serialNumber = params.serialNumber;
                equipment.model = params.model;
                equipment.description = params.description;
                equipment.custodian = params.custodian;
                equipment.equipmentNumber = params.equipmentNumber;
                equipment.brand = params.brand;*/

        //Save the assesment codes
        /*params.assesmentCodes = params.assesmentCodes.split(',').map(codigo => ({ assesmentCode: codigo.trim() }));
        equipment.assesmentCodes = params.assesmentCodes;*/

        //Check if the equipment already exists using assesmentCodes array
        /*const existingEquipment = await equipmentSchema.findOne({
            'assesmentCodes.assesmentCode': {
                $in: params.assesmentCodes.map(item => item.assesmentCode)
            }
        });*//*
        const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipment.equipmentId });

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
});*/
    },

    //Add image to an equipment
    addImage: async function (req, res) {
        const form = new formidable.IncomingForm();
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'El equipo no existe', //Equipment does not exists
                });
            }
            form.parse(req, async function (err, fields, files) {
                try {
                    console.log(files.equipmentPictures.length);
                    //Verify if all the photos from files are in the correct format
                    for (let i = 0; i < files.equipmentPictures.length; i++) {
                        if (files.equipmentPictures[i].mimetype != 'image/jpeg' && files.equipmentPictures[i].mimetype != 'image/png' && files.equipmentPictures[i].mimetype != 'image/jpg') {
                            return res.status(409).send({
                                message: 'Formato de archivo no soportado', //Image format not supported
                            });
                        }
                    }

                    //Read all the images files ans save it as a base64 string each one into the array photos in equipment
                    for (let i = 0; i < files.equipmentPictures.length; i++) {
                        const imageBuffer = await fs.readFile(files.equipmentPictures[i].filepath);
                        let quality = 100;
                        let compressedBuffer = imageBuffer;
                        if(files.equipmentPictures[i].mimetype == 'image/jpeg' || files.equipmentPictures[i].mimetype == 'image/jpg'){
                            do {
                                compressedBuffer = await sharp(imageBuffer)
                                    .jpeg({ quality: quality })
                                    .toBuffer();
                        
                                if (compressedBuffer.length / 1024 <= 250) {
                                    break;
                                }
                        
                                quality -= 5;
                            } while (quality > 0);
                        }else if(files.equipmentPictures[i].mimetype == 'image/png'){
                            do {
                                compressedBuffer = await sharp(imageBuffer)
                                    .png({ quality: quality })
                                    .toBuffer();
                        
                                if (compressedBuffer.length / 1024 <= 250) {
                                    break;
                                }
                        
                                quality -= 5;
                            } while (quality > 0);
                        }
                       
                        const imageBase64 = compressedBuffer.toString('base64');
                        existingEquipment.photos.push({
                            photo: imageBase64,
                            name: files.equipmentPictures[i].originalFilename,
                            type: files.equipmentPictures[i].mimetype,
                        });
                    }

                    //Modify the equipment
                    await equipmentSchema.updateOne({ equipmentId: equipmentId }, {
                        $set: existingEquipment
                    }, { new: true });

                    //Finish the request
                    return res.status(200).send({
                        message: 'Photo added successfully'
                    });

                } catch (error) {
                    console.log(error);
                    return res.status(500).send({
                        message: 'Error adding photo',
                        error: error
                    });
                }
            });
            return;

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: 'Error reading file',
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
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exists',
                });
            }

            // Remove the photo from the equipment object query
            const { _id, ...existingEquipmentWithoutId } = existingEquipment.toObject();

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

    //Update an equipment by id
    updateEquipment: async function (req, res) {
        // Declare equipment and form instance
        const form = new formidable.IncomingForm();
        try {
            //Take equipmet id
            var equipmentCode = req.params.id;
            var params = req.body;

            //Check if the equipment exists
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentCode });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'Equipment does not exist',
                });
            }

            // Save params in equipment object 
            var updateQRCode = params.updateQRCode;
            existingEquipment.name = params.name;
            existingEquipment.category = params.category;
            existingEquipment.subCategory = params.subCategory;
            existingEquipment.assesmentCode = params.assesmentCode;
            existingEquipment.previousCode = params.previousCode;
            existingEquipment.serialNumber = params.serialNumber;
            existingEquipment.model = params.model;
            existingEquipment.description = params.description;
            existingEquipment.custodian = params.custodian;
            existingEquipment.equipmentNumber = params.equipmentNumber;
            existingEquipment.brand = params.brand;
            existingEquipment.status = params.status;

            //Verifiy it needs to generate the qr code again
            if (updateQRCode) {
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
                message: 'Error updating equipment',
                error: error
            });
        }
        /*form.parse(req, async (err, fields, files) => {
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
                const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentCode });
                if (!existingEquipment) {
                    return res.status(409).send({
                        message: 'Equipment does not exist',
                    });
                }

                // Save params in equipment object 
                var updateQRCode = params.updateQRCode;
                existingEquipment.name = params.name;
                existingEquipment.category = params.category;
                existingEquipment.subCategory = params.subCategory;
                existingEquipment.assesmentCode = params.assesmentCode;
                existingEquipment.previousCode = params.previousCode;
                existingEquipment.serialNumber = params.serialNumber;
                existingEquipment.model = params.model;
                existingEquipment.description = params.description;
                existingEquipment.custodian = params.custodian;
                existingEquipment.equipmentNumber = params.equipmentNumber;
                existingEquipment.brand = params.brand;
                existingEquipment.status = params.status;*/

        //Save the assesment codes
        /*params.assesmentCodes = params.assesmentCodes.split(',').map(codigo => ({ assesmentCode: codigo.trim() }));
        existingEquipment.assesmentCodes = params.assesmentCodes;*/

        //Verifiy it needs to generate the qr code again
        /*if (updateQRCode) {
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
            message: 'Error updating equipment',
            error: error
        });
    }
});*/
    },

    //Delete an equipment by id
    deleteEquipment: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Check if the equipment already exists
            // and delete the equipment
            const deletedEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
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
    },

    //Delete some equipments by ids
    deleteEquipments: async function (req, res) {
        try {
            //Take Params
            const equipmentIds = req.body.equipmentId.split(',').map(item => item);

            //Check if Array is empty
            if (!Array.isArray(equipmentIds) || !equipmentIds.length) {
                return res.status(400).send({ message: 'Se requiere un array de IDs' });
            }

            //search the equipments
            const Equipments = await equipmentSchema.find({ equipmentId: equipmentIds });

            //Check if the equipments already exists
            if (Equipments.length == 0) {
                return res.status(404).send({
                    message: 'Equipments does not exists',
                });
            }

            //save IDs that were found
            const foundIds = Equipments.map(doc => doc.equipmentId.toString());

            //save IDs that were not found
            const notFoundIds = equipmentIds.filter(id => !foundIds.includes(id));

            //delete the equipments found
            const deletedEquipments = await equipmentSchema.deleteMany({ equipmentId: foundIds });

            //Check if all the equipments were deleted
            if (deletedEquipments.deletedCount != equipmentIds.length && deletedEquipments.deletedCount != 0) {
                return res.status(404).send({
                    message: `${deletedEquipments.deletedCount} equipments deleted successfully (${foundIds}) and ${equipmentIds.length - deletedEquipments.deletedCount} equipments does not exists (${notFoundIds})`,
                });
            }

            return res.status(200).send({
                message: 'all equipments deleted successfully',
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error deleting equipment',
            });
        }
    },

    //Delete image from an equipment
    deleteImage: async function (req, res) {
        try {
            //Take Params
            const equipmentId = req.params.id;

            //Take query
            const photoName = req.query.name;
            console.log(photoName);

            //Check if the equipment already exists
            const existingEquipment = await equipmentSchema.findOne({ equipmentId: equipmentId });
            if (!existingEquipment) {
                return res.status(409).send({
                    message: 'El equipo no existe', //Equipment does not exists
                });
            }

            //Check if the photo exists
            const existingPhoto = existingEquipment.photos.find(photo => photo.name == photoName);

            if (!existingPhoto) {
                return res.status(409).send({
                    message: 'La imagen no existe', //Photo does not exists
                });
            }

            //Delete the photo from the equipment object query
            existingEquipment.photos = existingEquipment.photos.filter(photo => photo.name != photoName);

            //Modify the equipment
            await equipmentSchema.updateOne({ equipmentId: equipmentId }, {
                $set: existingEquipment
            });

            return res.status(200).send({
                message: 'Imagen eliminada con exito' //Photo deleted successfully
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error eliminando la imagen', //Error deleting photo
            });
        }
    }
}

module.exports = equipmentController;