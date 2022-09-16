const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({

    title: String,
    detail: String,
    
}, {timestamps: true});

const Note = mongoose.model('note', NoteSchema);
module.exports = {Note};