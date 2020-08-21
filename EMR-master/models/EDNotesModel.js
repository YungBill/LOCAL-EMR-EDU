const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema
const EDNotesSchema = new Schema({
    patientID:  {type: String, require: true},
    
    // EDNotes_ID:  {type: String, require: true},
    // EDNotes_ID:  {
    //     type: Schema.Types.ObjectId
    // },

    dateArrivalED: {type: String, default: ''},
    arrivalTimeED:  {type: String, default: ''},
    modeOfArrED: {type: String, default: ''},
    referringFacilityED: {type: String, default: ''},
    chiefComplaintED: {type: String, default: ''},
    carepriorArrcheckED: {type: String, default: ''},
    carepriorArrED: {type: String, default: ''},
    pastHistoryED: {type: String, default: ''},
    drugallergycheckED: {type: String, default: ''},
    drugallergyspecifyED: {type: String, default: ''},
    otherallergycheckED: {type: String, default: ''},
    otherallergyspecifyED:  {type: String, default: ''},
    tempinfoED: {type: Number, default: ''},
    pulserateED: {type: Number, default: ''},
    respiratoryrateED: {type: Number, default: ''},
    bpratesbpED: {type: Number, default: ''},
    bpratedbpED: {type: Number, default: ''},
    spo2rateED: {type: Number, default: ''},
    triagepriorityED: {type: String, default: ''},
    initialAssessmentED: {type: String, default: ''},
    diagnosisED: {type: String, default: ''},
    investigationED: [String],
    xrayspecs: {type: String, default: ''},
    bloodtestspecs: {type: String, default: ''},
    bodyfluidsspecs: {type: String, default: ''},
    othersinvestigationspecs: {type: String, default: ''},
    treatmentordED: {type: String, default: ''}
});

mongoose.model('edModel', EDNotesSchema, 'ed-notes');
module.export = EDNotesSchema;