'use strict'
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquipmentLoanSchema = Schema({
    equipmentIds: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }],
    //Main user can be: teacher (recommend) student (if required)
    mainUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    /*
    If main user is an student then optional user can be the teacher
    If main user is an student then optional user can be null
    */
    optionalUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    loanStartDate: {
        type: Date,
        required: false,
    },
    loanReturnDate: {
        type: Date,
        required: true,
    },
    loanFinishDate: {
        type: Date,
        required: false,
    },
    loanStatus: {
        type: String,
        default: 'Active',
    },
    aditionalDetails: {
        type: String,
        required: false,
        default: '',
    },
    personnelId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = mongoose.model('EquipmentLoan', EquipmentLoanSchema);