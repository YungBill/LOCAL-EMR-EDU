const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const frequency = new Schema({
    frequency:  {type: String, require: true}
});

mongoose.model('drugFrequency', frequency, 'drugFrequency');