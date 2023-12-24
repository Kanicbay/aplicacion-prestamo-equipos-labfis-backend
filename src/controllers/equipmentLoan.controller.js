const userSchema = require('../models/user');
const equipmentSchema = require('../models/equipment');
const equipmentLoanSchema = require('../models/equipmentLoan');

const userController = {
    createEquipmentLoan: async function (req, res) {
        try {
            // Take Params
            const equipmentLoan = new equipmentLoanSchema();
            const params = req.body;
            equipmentLoan.equipmentIds = params.equipmentIds;
            equipmentLoan.mainUserId = params.mainUserId;
            equipmentLoan.optionalUserId = params.optionalUserId;
            equipmentLoan.loanStartDate = new Date();
            equipmentLoan.loanReturnDate = params.loanReturnDate;
            equipmentLoan.aditionalDetails = params.aditionalDetails;
            equipmentLoan.personnelId = params.personnelId;

            //Check if equipments that already loaned and save their models in an array
            const equipments = [];
            var areLoanedEquipments = false;
            for (const equipmentId of equipmentLoan.equipmentIds) {
                const existingEquipment = await equipmentSchema.findById(
                    equipmentId
                );
                if (existingEquipment.status === 'Loaned') {
                    areLoanedEquipments = true;
                    equipments.push(existingEquipment.category + ' ' + existingEquipment.model);
                }
            }

            // If there are loaned equipments, return them
            if (areLoanedEquipments) {
                return res.status(409).send({
                    message: 'Some equipments are already loaned',
                    equipments: equipments,
                });
            }

            // If there are no loaned equipments, save the equipment loan
            // Save the equipment loan log
            await equipmentLoan.save();

            // Change the status of every equipment to loaned
            for (const equipmentId of equipmentLoan.equipmentIds) {
                // Find and update the equipment status
                await equipmentSchema.findByIdAndUpdate(
                    equipmentId,
                    { $set: { status: 'Loaned' } }
                );
            }

            return res.status(200).send({
                message: 'Equipment loan created successfully',
            });

        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: 'Error loaning equipment',
                error: error,
            });
        }
    },

    // Get all equipment loans by main user id
    getEquipmentLoansByMainUserId: async function (req, res) {
        try {
            // Take Params
            const params = req.body;
            const mainUserId = params.mainUserId;

            // Find the equipment loans by main user id
            const equipmentLoans = await equipmentLoanSchema.find({
                mainUserId: mainUserId,
            });

            // If there are no equipment loans, return an error
            if (equipmentLoans == 0) {
                return res.status(409).send({
                    message: 'There are no equipment loans',
                });
            }

            return res.status(200).send({
                equipmentLoans,
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error getting equipment loans',
                error: error,
            });
        }
    },

    //Get all equipment loans
    getEquipmentLoans: async function (req, res) {
        try {
            //Get all equipment loans
            const equipmentLoans = await equipmentLoanSchema.find({});
            return res.status(200).send({
                equipmentLoans,
            });
        } catch (error) {
            return res.status(500).send({
                message: 'Error getting equipment loans',
                error: error,
            });
        }
    },

    // Finish an equipment loan
    finishEquipmentLoan: async function (req, res) {
        try {
            // Take Params
            const params = req.body;
            const equipmentLoanId = params.equipmentLoanId;

            // Find the equipment loan
            const existingEquipmentLoan = await equipmentLoanSchema.findById(
                equipmentLoanId
            );

            // If there is no equipment loan, return an error
            if (!existingEquipmentLoan) {
                return res.status(409).send({
                    message: 'Equipment loan does not exists',
                });
            }

            // Change the status of every equipment to available
            for (const equipmentId of existingEquipmentLoan.equipmentIds) {
                // Find and update the equipment status
                await equipmentSchema.findByIdAndUpdate(
                    equipmentId,
                    { $set: { status: 'Available' } }
                );
            }

            // Update the equipment loan status
            existingEquipmentLoan.loanStatus = 'Finished';
            existingEquipmentLoan.loanFinishDate = new Date();
            await existingEquipmentLoan.save();

            return res.status(200).send({
                message: 'Equipment loan finished successfully',
            });

        } catch (error) {
            return res.status(500).send({
                message: 'Error finishing equipment loan',
                error: error,
            });
        }
    },

   
    

};

module.exports = userController;
