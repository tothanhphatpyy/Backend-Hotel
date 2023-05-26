const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    sdt: { type: number, required: true, unique: true },
    password: String,
    name: String,
    email: String,
    number_accommodation: { type: Number, default: 0 }, // Số chỗ ở
    response_rate: { type: Number, default: 0 }, // Tỉ lệ phản hồi
    cancellation_rate: { type: Number, default: 0 }, // Tỉ lệ hủy phòng

    role: { type: Number, default: 1 },/* 0. Admin 1. User 2. Owner */

    //Trạng thái hoạt động
    status: { type: Number, default: 1 } /* 0. Inactive, 1. Active 2. Blocked */
}, { timestamps: true });

const User = mongoose.model('user', UserSchema);
module.exports = { User };