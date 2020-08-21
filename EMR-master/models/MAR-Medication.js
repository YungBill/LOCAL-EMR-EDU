const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const medication = new Schema({
    name:  {type: String},
    barcodeId:{type: String, default: ''},
    category:  {type: String},
    dose:  {type: String},
    route:  {type: String},
    frequency:  {type: String},
    doseType: {type: String},
    doseInterval: {type: String},
    numOfDoses: {type: Number},
    doseDate: {type: String},
    doseTime: [String],
    randomDoseDate: [String],
    randomDoseTime: [String],
    discontinuationDate: {type: String},
    discontinuationTime: {type: String},
    pharmacistVerification: {type: String},
    status: {type: String},
    cosign: {type: String},
    remarks: {type: String},
    nebList:  [String],
    caseId: {
        type: Schema.Types.ObjectId,
		ref: 'mar-case' 	// collection name in mongodb
    },
    slidingScaleId:{type: String},
    historyId:{type: String},
});

mongoose.model('mar-medication', medication, 'mar-medication');
