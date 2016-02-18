'use strict';

const mongoose = require('mongoose')
    , request  = require('request')
    , async    = require('async')
    , _        = require('lodash')
    , CONST    = require('../util/constants')
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
  total: { type: Number, default: 0 },
});

resourceSchema.statics.getDeck = (req, cb) => {
  let loc = {
    lat: Number(req.params.lat),
    long: Number(req.params.long)
  };
  let user = req.body.user || null;
  let radius = req.params.miles;
  let query = {};
  console.log("seen", user.strikes);

  async.auto({
    findNearbyPages: function(autoCb){
      wikiApi.findNearbyPages(loc, (err, pages) => {
        if (err || !pages) return autoCb(null, []);
        pages = new Set( pages.map(page => page.pageid) );
        autoCb(null, pages);
      });
    },
    findResources: function(autoCb){
      query = createDistQuery(query, loc, radius);
      console.log("resource query", query);
      Resource.find(query, (err, resources) => {
        if (err) {
          console.log("error finding resources", err);
          return autoCb(err);
        } else {
          return autoCb(null, resources);
        }
      })
    },
    findNewPages: ['findNearbyPages', 'findResources', function(autoCb, results){
      let nearbyPages = results.findNearbyPages;
      let foundResources = results.findResources;
      foundResources.forEach((resource) => {
        if (nearbyPages.has(resource.pageid)) nearbyPages.delete(resource.pageid);
      })
      let newPages = _.shuffle(nearbyPages).slice(0, CONST.newPageLim);
      autoCb(null, newPages)
    }],
    getNewPageInfo: ['findNewPages', function(autoCb, results) {
      let pageIds = results.findNewPages;
      wikiApi.getPageInfo(pageIds, (err, pages) => {
        autoCb(null, pages || {});
      })
    }],
    conditionKnownResources: ['findNewPages', function(autoCb, results){
      let resources = results.findResources;
      resources = filterSeenResources(resources, user);
      resources = sortResources(resources);
      autoCb(null, resources.slice(0, CONST.resourceLim));
    }],
    createNewResources: ['getNewPageInfo', function(autoCb, results) {
      let pageInfo = results.getNewPageInfo;
      async.map(Object.keys(pageInfo), (pageId, mapCb) => {
        resourceFromWikiPage(pageInfo[pageId], mapCb);
      }, (err, newResources) => {
        if (err || !newResources) return autoCb(null, []);
        autoCb(null, newResources.filter( resource => resource ));
      })
    }],
  }, function(err, results) {
    let deck = results.conditionKnownResources.concat(results.createNewResources)
    console.log("returning deck");
    deck.forEach(resource => {
      console.log(resource.info.title);
    })
    cb(null, deck)
  })

}

function sortResources(resources) {

  return resources
}

function filterSeenResources(resources, user) {
  let likes = user.likes.map((resource) => resource._id);
  let seen = new Set(likes.concat(user.strikes));
  return resources.filter(resource => {
    return !seen.has(resource._id.toString())
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
    if (err) {
      console.log("error getting img head", err);
      return cb(err);
    }
    resource.info.imgUrl = (resp.statusCode === 200) ? imgUrl : page.thumbnail.source;
    Resource.create(resource, (err, savedResource) => {
      if (err || !savedResource) console.log("error saving resource from page", err || resource);
      cb(null, savedResource || resource);
    })
  })
}

function createDistQuery(query, loc, radius) {
  let latRad = radius/69.2; // converts radius to degrees
  let longRad = (radius/69.2)*( (180 - Math.abs(loc.lat))/180 );
  let latR = { max: loc.lat + latRad, min: loc.lat - latRad };
  let longR = { max: loc.long + longRad, min: loc.long - longRad };
  query.lat = { $lt: latR.max, $gt: latR.min };
  query.long = { $lt: longR.max, $gt: longR.min };
  return query;
}

function createLikesQuery(query, user) {
  let likes = user.likes.map((resource) => resource._id);
  let viewedResources = new Set(likes.concat(user.strikes));
  query._id = { $nin: Array.from(viewedResources) }
  return query;
}

Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;







 //
