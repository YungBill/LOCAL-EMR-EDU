const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ModuleList = new Schema({
    courseCode:  {type: String, require: true},
    moduleCode:  {type: String, require: true},
    modulecourseDescriptn: {type: String, require: true},
    moduleID: {type: String, require: ''}
});

mongoose.model('moduleList', ModuleList, 'moduleList');