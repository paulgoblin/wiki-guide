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
  long: {type: Number, required: true},
  likes: {type: Number, default: 0},
  strikes: {type: Number, default: 0},
  category: { type: String, required: true },
});

resourceSchema.statics.getDeck = (req, cb) => {
  let loc = req.body.loc;
  let user = req.body.user || null;
  let radius = req.params.miles;
  let query = {};

  let latRad = radius/69; // converts radius to degrees
  let longRad = (radius/69)*( (180 - Math.abs(loc.lat))/180 );
  let latR = { max: loc.lat + latRad, min: loc.lat - latRad };
  let longR = { max: loc.long + longRad, min: loc.long - longRad };
  query.lat = { $lt: latR.max, $gt: latR.min };
  query.long = { $lt: longR.max, $gt: longR.min };
  console.log("resource query", query);

  Resource.find(query, (err, resources) => {
    if (err){
      console.log("error finding resources", err);
      return cb(err);
    } else {
      console.log("got resources", resources);
      return cb(null, resources)
    }
  })

}

Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
