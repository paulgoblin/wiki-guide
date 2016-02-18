'use strict';

const Pl = 0.2; // average probability of liking a resource per vote;

function sortResources(resources) {
  return resources.sort(function(a, b){
    return calcScore(b) - calcScore(a);
  })
}

function calcScore(resource) {
  let score = (resource.likes/resource.total)/Pl;
}

module.exports = {
  sortResources: sortResources,
}
