'use strict';

const express        = require('express')
    , User           = require('../models/user')
    , authMiddleware = require('../util/auth-middleware');
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

router.get('/:userId', authMiddleware, (req, res) => {
  User.getOneAuth(req, res, (err, user, res) => {
    res.send(err || user);
  })
})

module.exports = router;
