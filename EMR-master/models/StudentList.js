const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const StudentList = new Schema({
    studmoduleCode:  {type: String, require: true},
    studmoduleGroup:  {type: String, require: true},
    schoolCode: {type: String, require: true},
    studacadyearIntake: {type: String, require: true},
    sem: {type: String, default: ''},
    studtutMentorGrp: {type: String, default: ''},
    studadmNo: {type: String, require: true},
    studName: {type: String, require: true},
    studemail: {type: String, default: ''}
});

mongoose.model('studentList', StudentList, 'studentList');