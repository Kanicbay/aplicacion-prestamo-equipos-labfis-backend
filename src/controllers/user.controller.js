'use strict'
const e = require('express');
var userSchema = require('../models/user');

var userController = {
    //Update users into the database according to the data received from ldap
    updateUsers: async function(req, res) {
        try {
            //Take user data from Active Directory, assuming that the data is received in the following format: javascript object
            var adUsers = req.body;
            //Update de database with users from Active Directory, only those who do not exist in the database.
            //user data is assuming to be received in the following format: javascript object 
            adUsers.forEach(async function(adUser) {
                //Check if the user already exists
                const existingUser = await userSchema.findOne({
                    identificationCard: adUser.identificationCard,
                });
                if (!existingUser) {
                    //Create the user
                    var user = new userSchema();
                    user.fullName = adUser.fullName;
                    user.photo = adUser.photo;
                    user.institutionalEmail = adUser.institutionalEmail;
                    user.identificationCard = adUser.identificationCard;
                    user.rol = adUser.rol;
                    //Save the user
                    await user.save();
                } else {
                    //Update the user data
                    //The only user data that can be updated is the rol
                    existingUser.rol = adUser.rol;
                    //Save the user
                    await existingUser.save();
                }
            });
            return res.status(200).send({
                message: 'Database updated successfully',
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error updating database',
                error: error
            });
        }
    }
}

module.exports = userController;