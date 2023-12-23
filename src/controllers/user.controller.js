'use strict'
const e = require('express');
var userSchema = require('../models/user');

var userController = {
    //Update users into the database according to the data received from ldap
    updateUsers: async function(req, res) {
        try {
            //Take user data from Active Directory, assuming that the data is received in the following format: javascript object
            var ldapUsers = req.body;
            //Update de database with users from Active Directory, only those who do not exist in the database.
            //user data is assuming to be received in the following format: javascript object 
            ldapUsers.forEach(async function(ldapUser) {
                //Check if the user already exists
                const existingUser = await userSchema.findOne({
                    identificationCard: ldapUser.identificationCard,
                });
                if (!existingUser) {
                    //Create the user
                    var user = new userSchema();
                    user.fullName = ldapUser.fullName;
                    user.photo = ldapUser.photo;
                    user.institutionalEmail = ldapUser.institutionalEmail;
                    user.identificationCard = ldapUser.identificationCard;
                    await user.save();
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