'use strict';

const Pl = 0.2; // average probability of liking a resource per vote;

function sortResources(resources) {
  resources = resources.sort(function(a, b) {
    return calcScore(b) - calcScore(a);
  })
  resources.forEach(resource => {
    console.log(resource.likes);
  })
  return resources
}

function calcScore(resource) {
  if (resource.total === 0) return 0;
  let score = (resource.likes/resource.total)/Pl;
  return score;
}

module.exports = {
  sortResources: sortResources,
}
