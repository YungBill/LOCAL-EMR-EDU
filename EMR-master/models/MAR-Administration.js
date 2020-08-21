const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Administration = new Schema({
    medicationId: {type: Schema.Types.ObjectId, ref: 'mar-medication'},
    adminType: {type: String},
    date: {type: String},
    time: {type: String},
    remarks: {type:String, default:'' }, // Reason for Omission(Omitted)
    overdueTime:{type:String, default:'' },
    administeredBy: {type:String, default:'' },// Administered
    cosignedBy: {type:String, default:'' },// Administered
    caseId: {type: Schema.Types.ObjectId, ref: 'mar-case'}
});
module.exports= mongoose.model('medAdm', Administration, 'medAdm');