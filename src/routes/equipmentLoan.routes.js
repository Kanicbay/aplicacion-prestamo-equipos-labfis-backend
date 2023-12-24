const express = require('express');
const router = express.Router();
const equipmentLoanController = require('../controllers/equipmentLoan.controller');

// Add an equipment
router.post('/createEquipmentLoan', equipmentLoanController.createEquipmentLoan);

// Get an equipment by id
router.get('/getEquipmentLoan', equipmentLoanController.getEquipmentLoansByMainUserId);

// Get all equipments
router.get('/getEquipmentLoans', equipmentLoanController.getEquipmentLoans);

// Finsh an equipment
router.put('/finishEquipmentLoan', equipmentLoanController.finishEquipmentLoan);

module.exports = router;


