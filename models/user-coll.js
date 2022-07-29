const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const UserSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,

    name: String,
    email: String,
     /**
     * 1. Admin
     * 0. User
     */
    role: { type: Number, default: 0 },
    
    //Trạng thái hoạt động
    status: { type: Number, default: 1 },
}, {timestamps: true});

const User = mongoose.model('user', UserSchema);
module.exports = {User};