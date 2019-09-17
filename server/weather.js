const express = require('express');
const bodyParser = require('body-parser');

const { logger } = require('./lib/logger');
const airport = require('./middlewares/airport');

var app = express();
var router = express.Router();
var port = process.env.API_PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');

  // Remove cacheing so we get the most recent reports
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

/* This is the API entry point, it can be used to ensure the server is up and running. */
router.get('/', function(req, res) {
  res.json({ message: 'API currently running, please use /airport?q={ICAO} to access the data!'});
});

app.use('/', router);

app.listen(port, function() {
  const time = new Date()
  logger(`###   SERVER START   ###`)
  logger(`API running on port ${port}`);
});

/* This is the actual API request route.*/
router.route('/airport').get(airport());
