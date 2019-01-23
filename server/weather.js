const express = require('express');
const bodyParser = require('body-parser');
const artoo = require("artoo-js");
const cheerio = require('cheerio');

const { logger } = require('./lib/logger')
const { getTafIntl, getMetarIntl } = require('./lib/queryIntl');
const { getMetarCanada, getNotamCanada, getRvrCanada } = require('./lib/queryCanada')

/*  Request all reports from all the get[...] functions. Then returns a
    consolidated object if all are returned without error. */
getAirport = async airport => {
  const isCanadian = airport && ( airport.slice(0, 2) === "CY" || airport.slice(0, 2) === "CZ" )

  let metars, notams, rvr;

  if (isCanadian) {
    metars = await getMetarCanada(airport);
    notams = await getNotamCanada(airport);
    rvr = await getRvrCanada(airport);
  } else {
    metars = await getMetarIntl([airport]);
    tafs = await getTafIntl([airport]);
    metars = { ...metars, ...tafs }
    notams = { NOTAM: [{ title: null, notam: null }] }
    rvr = { RVR: null }
  }

  const error = "Invalid ICAO identifier"

  // Check that all reports contain info.
  if (metars.ERROR && notams.ERROR) {
    return { ERROR: "Invalid ICAO identifier", Station: airport, Timestamp: new Date() }
  } else if (metars && notams && rvr) {
    return {
      ...metars,
      ...notams,
      ...rvr,
      Station: airport,
      Timestamp: new Date(),
    }
  } else {
    logger("[ERROR] GetAirport did not receive all its info.")
    return null;
  }
}

/*  Transform the provided array into a list containing a Promises for each
    airport.  */
const getInfo = async airports => {
  return await Promise.all(airports.filter(airport => airport.length === 4).map(airport => getAirport(airport.toUpperCase())))
}

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
  res.json({ message: 'API currently running, please use /api/airport to access the data!'});
});

app.use('/', router);

app.listen(port, function() {
  const time = new Date()
  logger(`###   SERVER START   ###`)
  logger(`API running on port ${port}`);
});

/* This is the actual API request route.*/
router.route('/airport')
  .get(async function(req, res) {
    // Mark a time
    const requestReceived = new Date()
    let isResponseGood = false;
    const airportsRequest = req.query.q.split(/(\s|,)/).filter(item => item !== " " && item !== ",")
    const airportsInfo = await getInfo(airportsRequest)

    // Ensure requested number of items are all present in the report.
    if (airportsInfo.length === airportsRequest.length) {
      isResponseGood = true;
    }

    const requestSent = new Date()
    logger(`Request received for: ${req.query.q} [${isResponseGood ? 'PASS' : 'FAIL'}] - ${requestSent - requestReceived}ms`)

    if (!isResponseGood) {
      logger(`[WARN]Request made for ${airportsRequest}, but only ${airportsInfo.map(airport => airport["Station"])} returned.`)
    }

    res.json(airportsInfo)
  });
