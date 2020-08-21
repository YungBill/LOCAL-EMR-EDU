const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const StaffList = new Schema({
    staffname:  {type: String, default: ''},
	staffemail:  {type: String, default: ''}
});

mongoose.model('staffList', StaffList, 'staffList');