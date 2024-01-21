const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');


// Add an equipment
router.post('/add', equipmentController.addEquipment);

// Get an equipment by id
router.get('/getEquipment/:id', equipmentController.getEquipment);

// Get an equipment photos by id
router.get('/getEquipmentPhoto/:id', equipmentController.getEquipmentPhoto);

// Get all equipments
router.get('/getEquipments', equipmentController.getEquipments);

// Modify an equipment
router.put('/updateEquipment/:id', equipmentController.updateEquipment);

// Delete an equipment
router.delete('/deleteEquipment/:id', equipmentController.deleteEquipment);

module.exports = router;
