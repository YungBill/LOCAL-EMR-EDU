const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const Routes = new Schema({
    route:  {type: String, require: true}
});

mongoose.model('drugRoutes', Routes, 'drugRoutes');