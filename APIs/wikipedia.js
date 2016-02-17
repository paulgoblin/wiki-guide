'use strict';

const request = require('request')
    , wikiApi = require('../APIs/wikipedia');


function geoSearch (stuff) {
  console.log(stuff);
}

module.exports = {
  geoSearch: geoSearch,
}
