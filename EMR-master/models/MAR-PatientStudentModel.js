const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PatientStudentSchema = new Schema({
	patientId:  {type: String, require: true},
	nric:  {type: String, default: ''},
    familyName: {type: String, default: ''},
    givenName:  {type: String, default: ''},
    user: {
		type: Schema.Types.ObjectId,
		ref: 'emr-users' 	// collection name in mongodb
	},
    dateCreated: {type: Date, default: Date.now},
	dob: 		 {type: Date},
	gender:		 {type: String},
	weight:		 {type: Number},
    height:		 {type: Number},
    ward:	 	{type: String, default: ''},
    bed:		{type: String, default: ''},
    ethinicity:	 	{type: String, default: ''},
    allergy:		{type: String, default: ''},
    consultant:	 	{type: String, default: ''},
    diagnosis:		{type: String, default: ''},
    history:	 	{type: String, default: ''},
    masterPatient: {
		type: Schema.Types.ObjectId,
		ref: 'mar-patient-master' 	// collection name in mongodb
    },
    creator:		{type: String, default: ''},
    creatorEmail:	 	{type: String, default: ''},
});


// Create collection and add schema
mongoose.model('mar-patient-student', PatientStudentSchema, 'mar-patient-student');