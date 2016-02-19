'use strict';

const request  = require('request')
    , CONST    = require('../util/constants');


let WIKI_API = "https://en.wikipedia.org/w/api.php?action=query";

let resourceInfoQuery = `&prop=info|extracts|pageimages|coordinates`   // props
    + `&exintro=&explaintext=&exchars=300&exlimit=${CONST.newPageLim}` // extracts
    + `&inprop=url`                                        // info
    + `&pilimit=${CONST.newPageLim}`                       // pageimages
    + `$colimit=${CONST.newPageLim}`                       // coordinates
    + `&format=json`;                                      // format

function geoSearch (loc ,cb) {
  let lim = CONST.newPageLim;
  let rad = 10000; //meters
  let query = `&generator=geosearch&ggsradius=10000&ggslimit=${lim}&`
    + `ggscoord=${loc.lat}|${loc.long}`                    // generator
    + resourceInfoQuery;
  request(`${WIKI_API}${query}`, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      console.log("error at wikipApi.geoSearch");
      return cb(err)
    }
    return cb(null, JSON.parse(body).query.pages)
  })
}

function findNearbyPages (loc, cb) {
  let lim = 500;
  let rad = 10000; //meters
  let query = `&list=geosearch`
    + `&gsradius=${rad}`
    + `&gslimit=${lim}`
    + `&gscoord=${loc.lat}|${loc.long}`
    + `&format=json`;
    request(`${WIKI_API}${query}`, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        console.log("error at wikipApi.findNearbyPages", err);
        return cb(err)
      }
      return cb(null, JSON.parse(body).query.geosearch)
    })
}

function getPageInfo (ids, cb) {
  if (ids.length === 0) return cb(null, []);
  let query = '&pageids='
    + ids.reduce( (str, id) => `${str}|${id}`, '').slice(1)
    + resourceInfoQuery;
    console.log("get page info query", query);
    request(`${WIKI_API}${query}`, function (err, res, body) {
      if (err || res.statusCode !== 200) {
        console.log("error at wikipApi.getPageInfo", err);
        return cb(err)
      }
      return cb(null, JSON.parse(body).query.pages)
    })
}

module.exports = {
  geoSearch: geoSearch,
  findNearbyPages: findNearbyPages,
  getPageInfo: getPageInfo,
}

// https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggsradius=10000&ggslimit=10&ggscoord=37.5490704|-121.9430751&prop=info|revisions|extracts&exintro=&explaintext=&rvprop=content&rvsection=0&inprop=url&format=json

// https://en.wikipedia.org/w/api.php?action=query
// &generator=geosearch&ggsradius=10000&ggslimit=20&ggscoord={lat}|{long}
// &prop=info|extracts|pageimages
// &inprop=url
// &exintro=&explaintext=&exchars=300&exsectionformat=plain&exlimit=max
// &pilimit=max
// &format=json
