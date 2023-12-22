const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Update users from ldap
router.post('/updateUsers', userController.updateUsers);

module.exports = router;
