const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const history = new Schema({
    date:  {type: String},
    time:  {type: String},
    servedBy:  {type: String},
    historyId: {type: String}
});

mongoose.model('dose-history', history, 'dose-history');