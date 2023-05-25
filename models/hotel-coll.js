const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const HotelSchema = new Schema({

    type: String,
    nameRoom: String,
    imgDetail0: String,
    imgDetail1: String,
    imgDetail2: String,
    imgDetail3: String,
    detailLocation: String,
    districtLocation: String,
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
    
    status : { type: Number, default: 0 },   // 0.draft, 1.active , 2.rejected

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