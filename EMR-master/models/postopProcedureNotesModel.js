const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postopProcedureNotesSchema = new Schema({
    patientID: {type: String, require: true},
    diagnosisPostOpPN: {type: String, default: ''},
    surgeryopNature: {type: String, default: ''},
    datesessionStarted: {type: String, default: ''},
    timesessionStarted: {type: String, default: ''},
    datesessionCompleted: {type: String, default: ''},
    timesessionCompleted: {type: String, default: ''},
    theatreNo: {type: String, default: ''},
    anaesthesiaType: {type: String, default: ''},
    priorityOp: {type: String, default: ''},
    anaesthesiaAlert: {type: String, default: ''},
    principalAnaesthetist: {type: String, default: ''},
    assistant: {type: String, default: ''},
    surgicalCode: {type: String, default: ''},
    surgicalTable: {type: String, default: ''},
    firstSurgeon: {type: String, default: ''},
    secondSurgeon: {type: String, default: ''},
    assistant1: {type: String, default: ''},
    assistant2: {type: String, default: ''},
    findings: {type: String, default: ''},
    operativeProcedures: {type: String, default: ''},
    transferlocatnPO: {type: String, default: ''},
    monitoringPO: {type: String, default: ''},
    painManagement: {type: String, default: ''},
    oxygenTherapyPO: {type: String, default: ''},
    oralintakePO: {type: String, default: ''},
    activityPO: {type: String, default: ''},
    otherinstructionsPO: {type: String, default: ''}
});

mongoose.model('poProcedureNotesModel', postopProcedureNotesSchema, 'po-procedurenotes');
module.export = postopProcedureNotesSchema;