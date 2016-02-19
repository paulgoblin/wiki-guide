'use strict';

const  _ = require('lodash');

const maxDeckSize = 80      // max resources to return in a deck
    , Pl          = 0.2     // average probability of liking a resource per vote
    , cutOffTally = -0.51;  // likes - Pl*strikes at which we ditch the resource

function createDeck(resources, loc) {
  resources = _.shuffle(resources); // shuffle to randomize equal rankings
  let sorted = sortResources(resources, loc);
  let deck = mergeDecks(sorted.resources, sorted.unrated);
  return deck.slice(0, maxDeckSize)
}

function calcDist(coords1, coords2) {
  // calculate the distance betweeen two geo-coordiantes { lat: Num, long: Num }
  let sigFigs = 2;
  let milesPerDegreeLat = 69.2;
  let delx = (coords1.long - coords2.long)*((180 - Math.abs(coords1.lat))/180);
  let dely = coords1.lat - coords2.lat;
  let delx2 = Math.pow(delx,2);
  let dely2 = Math.pow(dely,2);
  let dist = Math.sqrt(delx2 + dely2)*milesPerDegreeLat;
  return dist.toPrecision(sigFigs);
}


function sortResources(resources, loc) {
  // returns sorted resources which have been voted on
  // returns unrated resources  sorted by distance
  // removes resources below the cutOffTally

  let unrated = [];
  resources = resources.filter((resource) => {
    if (!resource.total) {
      unrated.push(resource);
      return false;
    }
    let tally = resource.likes - Pl*resource.total;
    return (tally > cutOffTally);
  })
  .sort(function(a, b) {
    return calcScore(b, loc) - calcScore(a, loc)
  })

  unrated = unrated.sort(function(a, b) {
    return calcScore(b, loc) - calcScore(a, loc)
  })

  return { resources: resources, unrated: unrated }
}

function mergeDecks(deck1, deck2) {
  // merges one array into the other with roughly even spacing

  if (!(deck1.length && deck2.length)) {
    return deck1.concat(deck2);
  }
  let deck1isBigger = (deck1.length >= deck2.length);
  let long = deck1isBigger ? deck1 : deck2;
  let short = deck1isBigger ? deck2 : deck1;
  let spacing = Math.floor(long.length/short.length);
  let chunked = _.chunk(long, spacing);
  return _.flatten(
    chunked.map( (chunk, i) => {
      return short[i] ? chunk.concat(short[i]) : chunk;
    })
  )
}

function calcScore(resource, userLoc) {

  let likeFactor  = 2  // importance of likeability
    , proxFactor  = 1  // importance of proximity
    , likeability = 0  // 0 - 1
    , proximity   = 0; // 0 - 1
  if (resource.total) {
    likeability = (resource.likes/resource.total);
  }
  if (userLoc) {
    let resLoc = { lat: resource.lat, long: resource.long };
    let dist = calcDist(userLoc, resLoc);
    proximity = Math.max((10 - dist)/10, 0);
  }
  let score = likeFactor*likeability + proxFactor*proximity;
  return score
}

module.exports = {
  createDeck: createDeck,
  calcDist: calcDist
}
