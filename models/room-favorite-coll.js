const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomFavoriteSchema = new Schema({
    user : { 
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    hotel : {
        type: Schema.Types.ObjectId,
        ref: 'hotel'
    },
}, {timestamps: true});

const RoomFavorite = mongoose.model('roomFavorite', RoomFavoriteSchema);

module.exports = {RoomFavorite};