'use strict';

const PORT         = process.env.PORT || 3000
    , express      = require('express')
    , bodyParser   = require('body-parser')
    , morgan       = require('morgan')
    , cors         = require('cors')
    , compression  = require('compression')
    , path         = require('path')
    , mongoose     = require('mongoose')
    , CONST        = require('./util/constants')
    , mongoUrl     = process.env.MONGOLAB_URI || 'mongodb://localhost/wiki-guide';

mongoose.connect(mongoUrl);

let app = express();

// CORS
let whitelist = ['http://paulgoblin.github.io', 'http://localhost:8000'];
let corsOptions = {
  origin: function(origin, callback) {
    let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};
app.use(cors(corsOptions));

// GENERAL MIDDLEWARE
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(bodyParser.json());

// ROUTES
app.use('/users', require('./routes/users'));
app.use('/resources', require('./routes/resources'));
app.use('/', (req, res) => {
  console.log("in SLASH!!", req.url);
  res.status(200).send(`Welcome to ZOMBO.C *cough* I mean, wiki-guide-api. We\'re on the air.\n\n\nYou probably meant to go to ${CONST.frontEndUrl}`)
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).send('route not found')
})

// LISTEN
app.listen(PORT, () => {
  console.log('Listening on port ', PORT);
});
