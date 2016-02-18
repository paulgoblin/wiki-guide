'use strict';

const mongoose = require('mongoose')
    , request  = require('request')
    , async    = require('async')
    , wikiApi  = require('../APIs/wikipedia');

let imageSize = '370px';

let Resource;

let resourceSchema = mongoose.Schema({
  pageid: { type: Number, required:true, unique:true },
  info: {
    title:  { type: String, required: true },
    url:    { type: String, required: true },
    imgUrl: { type: String },
    intro:  { type: String },
  },
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
  likes: { type: Number, default: 0 },
  strikes: { type: Number, default: 0 },
});

resourceSchema.statics.getDeck = (req, cb) => {
  let loc = {
    lat: Number(req.params.lat),
    long: Number(req.params.long)
  };
  let user = req.body.user || null;
  let radius = req.params.miles;
  let query = {};

  // wikiApi.geoSearch(loc, (err, pages) => {
  //   if (err) return cb(err)
  //
  //   let deck = [];
  //
  //   async.forEachOf(pages, function(page, key, asynccb) {
  //     resourceFromWikiPage(page, function(err, resource){
  //       if (err) return asynccb(err);
  //       deck.push(resource);
  //       asynccb();
  //     });
  //   }, function(err) {
  //     if (err) return cb(err);
  //     return cb(null, deck);
  //   });
  // });



  let foundNearby = new Promise(function(resolve, reject){
    wikiApi.findNearby(loc, (err, pages) => {
      if (err || !pages) return resolve([]);
      pages = new Set( pages.map(page => page.pageid) );
      resolve( pages );
    })
  })

  let foundResources = new Promise(function(resolve, reject){
    query = makeDistQuery(query, loc, radius);
    query = makeLikesQuery(query, user);
    console.log("resource query", query);
    Resource.find(query, (err, resources) => {
      if (err) {
        console.log("error finding resources", err);
        reject(err);
      } else {
        return resolve(resources);
      }
    })
  })

  Promise.all([foundNearby, foundResources]).then(function(results){
    let nearbyPages = results[0];
    let foundResources = results[1];
    foundResources.forEach((resource) => {
      if (nearbyPages.has(resource.pageid)) nearbyPages.delete(resource.pageid);
    })
    console.log("nearbyPages", nearbyPages);
    cb(null, results[1]);
  }, function(err) {
    cb(err);
  })

}

function resourceFromWikiPage(page, cb) {
  if (!page.thumbnail || !page.coordinates) return cb(null, null);
  let imgUrl = page.thumbnail.source.replace(/\d*px/, imageSize);
  let resource = {
    pageid: page.pageid,
    info: {
      title: page.title,
      url: page.fullurl,
      intro: page.extract
    },
    lat: page.coordinates[0].lat,
    long: page.coordinates[0].lon,
  };
  request.head(imgUrl, (err, resp) => {
    if (err) return cb(err);
    resource.info.imgUrl = (resp.statusCode === 200) ? imgUrl : page.thumbnail.source;
    Resource.create(resource, (err, savedResource) => {
      if (err) console.log("error saving resource from page", err);
      cb(null, savedResource || resource);
    })
  })
}

function makeDistQuery(query, loc, radius) {
  let latRad = radius/69.2; // converts radius to degrees
  let longRad = (radius/69.2)*( (180 - Math.abs(loc.lat))/180 );
  let latR = { max: loc.lat + latRad, min: loc.lat - latRad };
  let longR = { max: loc.long + longRad, min: loc.long - longRad };
  query.lat = { $lt: latR.max, $gt: latR.min };
  query.long = { $lt: longR.max, $gt: longR.min };
  return query;
}

function makeLikesQuery(query, user) {
  let likes = user.likes.map((resource) => resource._id);
  let viewedResources = new Set(likes.concat(user.strikes));
  query._id = { $nin: Array.from(viewedResources) }
  return query;
}

Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;







 //
