'use strict';

const express        = require('express')
    , User           = require('../models/user')
    // , Resource       = require('../models/resource')
    // , authMiddleware = require('../util/auth-middleware')
    // , combinedQuery  = require('../util/combinedQuery');

let router = express.Router();

router.post('/register', (req, res) => {
  User.register(req.body, (err, token) => {
    res.status(err ? 400 : 200).send(err || token);
  });
});

router.post('/login', (req, res) => {
  User.login(req.body, (err, token) => {
    res.status(err ? 400 : 200).send(err || token);
  });
});


router.get('/', (req, res) => {
  res.status(200).send("here's your users");
})

module.exports = router;
