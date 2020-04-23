var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Profile = new mongoose.Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User' },
    fullName : { type:String},
    id: String,
    address1: { type:String},
    address2: { type:String},
    city: { type:String},
    state: { type:String},
    zip: { type:Number},
    quotes: [{type: Schema.Types.ObjectId, ref: 'Quote'}]
});

module.exports = mongoose.model("Profile", Profile);