const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');

// Add an equipment
router.post('/add', equipmentController.addEquipment);

// Get all equipments
router.get('/equipments', equipmentController.getEquipments);

// Modify an equipment
router.put('/updateEquipment', equipmentController.modifyEquipment);

module.exports = router;
