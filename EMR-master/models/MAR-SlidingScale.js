const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const scale = new Schema({
    index:  {type: String},
    BG:  {type: String},
    additionalInsulin:  {type: String},
    scaleId: {type: String}
});

mongoose.model('sliding-scale', scale, 'sliding-scale');