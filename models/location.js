const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var locationSchema = new Schema({
    name: String,
    businesses: [{
        id: String,
        name: String,
        image_url: String,
        url: String,
        display_address: [],
        display_phone: String,
        distance: String,
        businessReserved: []
    }]
});

module.exports = mongoose.model('Location', locationSchema);
