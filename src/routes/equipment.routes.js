const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');


// Add an equipment
router.post('/add', equipmentController.addEquipment);

// Add an equipment excel
router.post('/addExcel', equipmentController.addEquipmentExcel);

// Add image to an equipment
router.post('/addImage/:id', equipmentController.addImage);

// Get an equipment by id
router.get('/getEquipment/:id', equipmentController.getEquipment);

// Get an equipment photos by id
router.get('/getEquipmentPhoto/:id', equipmentController.getEquipmentPhoto);

// Get all equipments
router.get('/getEquipments', equipmentController.getEquipments);

// Modify an equipment by id
router.put('/updateEquipment/:id', equipmentController.updateEquipment);

// Delete an equipment by id
router.delete('/deleteEquipment/:id', equipmentController.deleteEquipment);

// Delete some equipments by ids
router.delete('/deleteEquipments', equipmentController.deleteEquipments);

// Delete image from an equipment
router.delete('/deleteImage/:id', equipmentController.deleteImage);

module.exports = router;
