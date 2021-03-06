const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    id: String,
    token: String,
    email: String,
    name: String
});

module.exports = mongoose.model('User', userSchema);
