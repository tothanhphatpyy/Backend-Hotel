const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const HotelSchema = new Schema({

    type: String,
    nameRoom: String,
    img: String,
    detailLocation : String,

    typeRoom: String,
    numberBedRoom: String,
    numberBathRoom: String,
    numberBed: String,
    numberPeople: String,
    detailRoom: String,
    priceMon_Fri: String,
    priceWeb_Sun: String,
    priceDiscount: String,
    detailRules: String,
    

    location : { 
        type: Schema.Types.ObjectId,
        ref : 'location'
    },
    user : { 
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
});

const Hotel = mongoose.model('hotel', HotelSchema);
module.exports = {
    Hotel
};