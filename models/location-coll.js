const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const LocationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: String,
});

const Location = mongoose.model('location', LocationSchema) ;
module.exports = {
    Location
};