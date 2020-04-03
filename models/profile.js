var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Profile = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName : String,
    id: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: Number,
    quotes: [{type: Schema.Types.ObjectId, ref: 'Quote'}]
});

module.exports = mongoose.model("Profile", Profile);