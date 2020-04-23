var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Quote = new mongoose.Schema({
    //Gallons Requested	Delivery Address	Delivery Date	Suggested Price	Total Amount Due
    userID: { type: Schema.Types.ObjectId, ref: 'Profile' },
    username: String,
    gallons: { type: Number},
    dilvery: String,
    date: { type:String},
    sugPrice: Number,
    due: Number

});

module.exports = mongoose.model("Quote", Quote);