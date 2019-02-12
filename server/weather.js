const express = require('express');
const bodyParser = require('body-parser');
const artoo = require("artoo-js");
const cheerio = require('cheerio');

const { logger } = require('./lib/logger')
const { getTafIntl, getMetarIntl, getNotamIntl } = require('./lib/queryIntl');
const { getCanadianAirports } = require('./lib/queryCanada')

/*  Request all reports from all the get[...] functions. Then returns a
    consolidated object. */
getAirports = async airports => {
  let metarsIntl
  let tafsIntl
  let notamsIntl

  if (airports.intl.length > 0) {
    metarsIntl = await getMetarIntl(airports.intl)
    tafsIntl = await getTafIntl(airports.intl)
  }
  // notamsIntl must alwasy be called to get KGPS notams.
  notamsIntl = await getNotamIntl(airports.intl)

  let flightPlanInfo = new Object()
  airports.intl.forEach(airport => {
    flightPlanInfo[airport] = {
      "metar": metarsIntl[airport],
      "taf": tafsIntl[airport],
      "notam": notamsIntl[airport]
    }
  })

  const canAirports = await getCanadianAirports(airports)

  airports.canada.forEach(airport => {
    flightPlanInfo[airport] = canAirports[airport]
  })

  flightPlanInfo['other_notam'] = {...canAirports['other_notam']}

  flightPlanInfo['other_notam'].KGPS = notamsIntl['other_notam'].KGPS ? notamsIntl['other_notam'].KGPS : null

  flightPlanInfo.Timestamp = new Date()

  return flightPlanInfo
}

/*  Transform the provided array into a list containing a Promises for each
    airport.  */
const getInfo = async airports => {

  const validAirports = airports.filter(airport => airport.length === 4)
  const intlAirports = validAirports.filter(icao => icao.slice(0, 2) !== "CY" && icao.slice(0, 2) !== "CZ" )
  const canadianAirports = validAirports.filter(icao => icao.slice(0, 2) === "CY" || icao.slice(0, 2) === "CZ" )

  return await getAirports({intl: intlAirports, canada: canadianAirports})
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
    // if (airportsInfo.length === airportsRequest.length) {
    //   isResponseGood = true;
    // }

    isResponseGood = true

    const requestSent = new Date()
    logger(`Request received for: ${req.query.q} [${isResponseGood ? 'PASS' : 'FAIL'}] - ${requestSent - requestReceived}ms - IP: ${req.headers['x-forwarded-for']}`)

    if (!isResponseGood) {
      logger(`[WARN]Request made for ${airportsRequest}, but only ${airportsInfo.map(airport => airport["Station"])} returned.`)
    }

    res.json(airportsInfo)
  });
