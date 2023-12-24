const express = require('express');
const router = express.Router();
const equipmentLoanController = require('../controllers/equipmentLoan.controller');

// Add an equipment
router.post('/createLoan', equipmentLoanController.createLoan);

module.exports = router;
