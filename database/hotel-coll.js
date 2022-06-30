const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const HotelSchema = new Schema({

    nameRoom: String,
    img: String,
    detailLocation : String,
    detailRoom: String,
    price: String,

    location : { 
        type: Schema.Types.ObjectId,
        ref : 'location'
    },
});

const Hotel = mongoose.model('hotel', HotelSchema);
module.exports = {
    Hotel
};