const mongoose = require('mongoose');

//SCHEMA SETUP
module.exports.campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

module.exports.Campground = mongoose.model("Campground", campgroundSchema);
