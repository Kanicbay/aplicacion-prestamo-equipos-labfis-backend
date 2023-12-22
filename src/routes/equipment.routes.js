const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');

// Add an equipment
router.post('/add', equipmentController.addEquipment);

// Get an equipment by id
router.get('/getEquipment', equipmentController.getEquipment);

// Get all equipments
router.get('/equipments', equipmentController.getEquipments);

// Modify an equipment
router.put('/updateEquipment', equipmentController.updateEquipment);

// Delete an equipment
router.delete('/deleteEquipment', equipmentController.deleteEquipment);

module.exports = router;
