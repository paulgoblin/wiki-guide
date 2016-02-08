'use strict';

const express  = require('express')
    , Resource = require('../models/resource');
    // , authMiddleware = require('../util/auth-middleware')

let router = express.Router();

router.get('/', (req, res) => {
  Resource.find(req.body.query || {}, (err, resources) => {
    res.status(err ? 400 : 200).send(err || resources)
  })
})

router.get('/id/:resourceId', (req, res) => {
  Resource.findById(req.params.resourceId, (err, resource) => {
    res.status(err ? 400 : 200).send(err || resource)
  })
})

router.post('/', (req, res) => {
  console.log("req.body", req.body);
  Resource.create(req.body, (err, savedResource) => {
    res.status(err ? 400 : 200).send(err || savedResource)
  })
})

module.exports = router;
