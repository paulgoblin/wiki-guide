'use strict';

const  _ = require('lodash');

const maxDeckSize = 80      // max resources to return in a deck
    , Pl          = 0.2     // average probability of liking a resource per vote
    , cutOffTally = -0.51;  // likes - Pl*strikes at which we ditch the resource

function createDeck(resources) {
  let sorted = sortResources(resources);
  let deck = mergeDecks(sorted.resources, _.shuffle(sorted.unrated));
  return deck.slice(0, maxDeckSize)
}

function sortResources(resources) {
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
    return calcScore(b) - calcScore(a);
  }).map( (resource) => {
    console.log(resource.likes);
    return resource
  })

  return { resources: resources, unrated: unrated }
}

function mergeDecks(deck1, deck2) {
  if (!(deck1.length && deck2.length)) {
    return deck1.concat(deck2);
  }
  let tot = deck1.length + deck2.length;
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


function calcScore(resource) {
  if (resource.total === 0) return 0;
  let pLike = (resource.likes/resource.total)/Pl;
  return pLike;
}

module.exports = {
  createDeck: createDeck,
}
