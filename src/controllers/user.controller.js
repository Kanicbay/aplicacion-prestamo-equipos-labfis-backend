'use strict'
const e = require('express');
var userSchema = require('../models/user');

var userController = {
    //Create and update users into the database according to the data received from ldap
    updateUsers: async function(req, res) {
        try {
            //Take user data from ldap, assuming that the data is received in the following format: javascript object
            var ldapUsers = req.body;
            //For each user in ldapUsers, create or update the user in the database
            ldapUsers.forEach(async function(ldapUser) {
                //Check if the user already exists
                const existingUser = await userSchema.findOne({
                    institucionalEmail: ldapUser.institucionalEmail,
                });
                if (!existingUser) {
                    //Create the user
                    var user = new userSchema();
                    user.fullName = ldapUser.fullName;
                    user.photo = ldapUser.photo;
                    user.institucionalEmail = ldapUser.institucionalEmail;
                    await user.save();
                } else {
                    //Update the user
                    existingUser.fullName = ldapUser.fullName;
                    existingUser.photo = ldapUser.photo;
                    await existingUser.save();
                }
            });
            return res.status(200).send({
                message: 'Users updated successfully',
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error updating users',
                error: error
            });
        }
    }
}

module.exports = userController;