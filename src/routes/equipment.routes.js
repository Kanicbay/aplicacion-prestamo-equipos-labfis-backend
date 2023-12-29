const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipment.controller');
const multyparty = require('connect-multiparty');
const multypartyMiddleware = multyparty({ uploadDir: './src/images' });

// Add an equipment
router.post('/add', equipmentController.addEquipment);

// Add an image to an equipment
router.post('/addImage/:id', multypartyMiddleware, equipmentController.addImage);

// Get an image from an equipment
router.get('/getImage/:imageFile', equipmentController.getImage);

// Get an equipment by id
router.get('/getEquipment/:id', equipmentController.getEquipment);

// Get all equipments
router.get('/getEquipments', equipmentController.getEquipments);

// Modify an equipment
router.put('/updateEquipment', equipmentController.updateEquipment);

// Delete an equipment
router.delete('/deleteEquipment/:id', equipmentController.deleteEquipment);

module.exports = router;
