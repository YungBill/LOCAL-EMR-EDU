const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const marCase = new Schema({
    date:  {type: String},
    time:  {type: String},
    patientId: {type: String, require: true},
});

mongoose.model('mar-case', marCase, 'mar-case');