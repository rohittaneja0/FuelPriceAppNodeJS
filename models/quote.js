var mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Quote = new mongoose.Schema({
    //Gallons Requested	Delivery Address	Delivery Date	Suggested Price	Total Amount Due
    username: String,
    gallons: Number,
    dilvery: String,
    date: String,
    sugPrice: Number,
    due: Number

});

module.exports = mongoose.model("Quote", Quote);