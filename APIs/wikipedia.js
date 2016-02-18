'use strict';

const request  = require('request'),
      WIKI_API = "https://en.wikipedia.org/w/api.php?action=query";

function geoSearch (loc ,cb) {
  let lim = 10;
  let rad = 10000; //meters
  let query = `&generator=geosearch&ggsradius=10000&ggslimit=${lim}&`
            + `ggscoord=${loc.lat}|${loc.long}`;                // generator
  query += `&prop=info|extracts|pageimages|coordinates`;        // props
  query += `&inprop=url`;                                       // info
  query += `&exintro=&explaintext=&exchars=300&exlimit=${lim}`  // extracts
  query += `&pilimit=${lim}`                                    // pageimages
  query += `$colimit=${lim}`                                    // coordinates
  query += `&format=json`                                       // format
  console.log("querying wiki", query);
  request(`${WIKI_API}${query}`, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      console.log("error at wikipApi.geoSearch");
      return cb(err)
    }
    return cb(null, JSON.parse(body).query.pages)
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
