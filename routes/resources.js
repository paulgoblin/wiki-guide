'use strict';

const express  = require('express')
    , Resource = require('../models/resource');
    // , authMiddleware = require('../util/auth-middleware')

let router = express.Router();

router.get('/', (req, res) => {
  Resource.find({}, (err, resources) => {
    res.status(err ? 400 : 200).send(err || resources)
  })
})

module.exports = router;
