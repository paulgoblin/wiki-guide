'use strict';

const mongoose = require('mongoose')

let Resource;

let resourceSchema = mongoose.Schema({
  info: {
    title: {type: String, required: true},
    url: {type: String, required: true},
    imgUrl: {type: String,},
    intro: {type: String,},
  },
  lat: {type: Number, required: true},
  lang: {type: Number, required: true},
  likes: {type: Number, default: 0},
  strikes: {type: Number, default: 0},
  category: { type: String, required: true },
});

Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
