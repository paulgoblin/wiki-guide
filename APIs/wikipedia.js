'use strict';

const request  = require('request'),
      WIKI_API = "https://en.wikipedia.org/w/api.php?action=query";

function geoSearch (loc ,cb) {
  let lim = 20;
  let rad = 10000; //meters
  let query = `&generator=geosearch&ggsradius=10000&ggslimit=20&`
            + `ggscoord=${loc.lat}|${loc.long}`;            // generator
  query += `&prop=extracts|pageimages|coordinates`;          // props
  // query += `&inprop=url`;                                   // info
  query += `&exintro=&explaintext=&exchars=300&exlimit=max` // extracts
  query += `&pilimit=max`                                   // pageimages
  query += `$colimit=max`                                   // coordinates
  query += `&format=json`                                   // format

  console.log("reqUrl", query);
  request(`${WIKI_API}${query}`, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      console.log("error at wikipApi.geoSearch", err);
      return cb(err)
    }
    return cb(null, body)
  })
}

module.exports = {
  geoSearch: geoSearch,
}

// https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggsradius=10000&ggslimit=10&ggscoord=37.5490704|-121.9430751&prop=info|revisions|extracts&exintro=&explaintext=&rvprop=content&rvsection=0&inprop=url&format=json

// https://en.wikipedia.org/w/api.php?action=query
// &generator=geosearch&ggsradius=10000&ggslimit=20&ggscoord={lat}|{long}
// &prop=info|extracts|pageimages
// &inprop=url
// &exintro=&explaintext=&exchars=300&exsectionformat=plain&exlimit=max
// &pilimit=max
// &format=json
