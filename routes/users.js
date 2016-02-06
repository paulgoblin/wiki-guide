'use strict';

const express        = require('express')
    // , User           = require('../models/user')
    // , Resource       = require('../models/resource')
    // , authMiddleware = require('../util/auth-middleware')
    // , combinedQuery  = require('../util/combinedQuery');

let router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("here's your users");
})

module.exports = router;
