const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DrugList = new Schema({
    drug:  {type: String, require: true},
	medicationName:  {type: String, default: ''},
	strength: {type: String, default: ''},
	preparation:  {type: String, default: ''},
	barcodeId:{type: String, default: ''},
});

mongoose.model('drugList', DrugList, 'drugList');