const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OderSchema = new Schema({

    totalPrice: String,
    dayOder: String,
    dayReturn : String,
    dateOder: Date,
    dateReturn: Date,
    numberPeople: String,
    numberChildren: String,
    
    /* Trạng thái thanh toán
    0. Chưa thanh toán
    1. Đã thanh toán
    2. Thanh toán thất bại */
    status_payment : { type: Number, default: 0 },

    /* Xác nhận từ chủ nhà
    0. Chưa xác nhận
    1. Đã xác nhận
    2. Từ chối */
    status_confirm : { type: Number, default: 0 },

    /* Trạng thái chỗ ở
    0. Chưa ở
    1. Đang ở
    2. Đã ở 
    3. Đã hủy*/
    status_booking : { type: Number, default: 0 },

    hotel : {
        type: Schema.Types.ObjectId,
        ref: 'hotel'
    },
    user : { 
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
}, {timestamps: true});

const Oder = mongoose.model('oder', OderSchema);

module.exports = {Oder};