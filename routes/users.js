'use strict';

const express        = require('express')
    , User           = require('../models/user')
    , authMiddleware = require('../util/auth-middleware');
let router = express.Router();

router.post('/register', (req, res) => {
  User.register(req.body, (err, token) => {
    if (err) console.log("error registering", err);
    res.status(err ? 400 : 200).send(err || token);
  });
});

router.post('/login', (req, res) => {
  User.login(req.body, (err, token) => {
    if (err) console.log("error logging in", err);
    res.status(err ? 400 : 200).send(err || token);
  });
});

router.get('/', (req, res) => {
  res.status(200).send("here's your users");
})

router.get('/user/:userId', authMiddleware, (req, res) => {
  console.log("getting user", req.params.userId);
  User.getOneAuth(req, res, (err, user, res) => {
    res.send(err || user);
  })
})

router.post('/likeResource/:resourceId', authMiddleware, (req, res) => {
  User.likeResource(req.params.resourceId, req.userId, (err, msg) =>{
    res.status(err ? 400 : 200).send(err || msg);
  })
})

router.post('/strikeResource/:resourceId', authMiddleware, (req, res) => {
  User.strikeResource(req.params.resourceId, req.userId, (err, msg) =>{
    res.status(err ? 400 : 200).send(err || msg);
  })
})

module.exports = router;
