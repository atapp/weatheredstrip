const express = require('express');
const bodyParser = require('body-parser');
const artoo = require("artoo-js");
const cheerio = require('cheerio');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

artoo.bootstrap(cheerio);

/*  Makes a request to NAV Canada for the specified station METAR webpage. Then
    returns the METARs and TAFs as an object. */
const getMetar = async station => {
  const params = new URLSearchParams({
    NoSession: 'NS_Inconnu',
    Stations: station,
    format: 'raw',
    Langue: 'anglais',
    Region: 'can',
    Location: ''
  })

  const options = {
    method: 'POST',
    body: params
  };

  const url = 'https://flightplanning.navcanada.ca/cgi-bin/Fore-obs/metar.cgi'
  const MetarParser = 'div[style="text-indent:-1.5em;margin-left:1.5em"]'

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $(MetarParser).scrape('text');

    // trim whitespace at 0 and remove '=' at the end of each line
    const metar = await data.map(daton => daton.slice(1, daton.indexOf('=')))

    // A regex to strip the correct line returns from the inline TAF info
    const re = /\n\s*(?=BECMG|FM\d{6}|RMK)/
    const taf = await metar.pop().split(re)
    return { METAR: metar, TAF: taf }
  } catch (err) {
    console.log(err)
    return null
  }
}


/*  Makes a request to NAV Canada for the specified station RVR webpage. Then
    returns the RVR image link as an object */
const getRVR = async station => {
  const baseURL = 'http://atm.navcanada.ca'
  const rvrParser = 'img[alt="Aerodrome chart"]'
  try {
    const response = await fetch(baseURL + '/atm/iwv/' + station)
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $('img[alt="Aerodrome chart"]').scrapeOne('src');

    const RVR = data === undefined ? { RVR: null } : { RVR: baseURL + data }
    return RVR
  } catch (err) {
    console.log(err)
    return null
  }
}

/*  Makes a request to NAV Canada for the specified station NOTAM webpage. Then
    returns the NOTAMs as an object. */
const getNotam = async station => {
  const params = new URLSearchParams({
    Langue: 'anglais',
    TypeBrief: 'N',
    NoSession: 'NS_Inconnu',
    Stations: station,
    Location: '',
    ni_File: 'on'
  })

  const options = {
    method: 'POST',
    body: params
  };

  const url = 'https://flightplanning.navcanada.ca/cgi-bin/Fore-obs/notam.cgi'
  const NotamParser = '#notam_print_item > pre'

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $(NotamParser).scrape('text');

    const notams = await data.map(notam => {
      // add a filter for extra '\n' that cause impromptu line return
      const trimmedNotam = notam.substring(1, notam.length - 1)
      const titleEnd = trimmedNotam.indexOf("\n")
      return {
        title: trimmedNotam.slice(0, titleEnd),
        notam: trimmedNotam.slice(titleEnd + 1)
      }
    })
    return ({ NOTAM: notams })
  } catch (err) {
    console.log(err)
    return null
  }
}

/*  Request all reports from all the get[...] functions. Then returns a
    consolidated object if all are returned without error. */
getAirport = async airport => {
  const metars = await getMetar(airport);
  const notams = await getNotam(airport);
  const rvr = await getRVR(airport);

  // Check that all reports contain info.
  if (metars && notams && rvr) {
    return {
      ...metars,
      ...notams,
      ...rvr,
      Station: airport.toUpperCase(),
      Timestamp: new Date(),
    }
  } else {
    return null;
  }
}

/*  Transform the provided array into a list containing a Promises for each
    airport.  */
const getInfo = async airports => {
  return await Promise.all(airports.map(airport => getAirport(airport)))
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
  res.json({ message: 'API currently running, please use "/airport" to access the data!'});
});

app.use('/', router);

app.listen(port, function() {
  console.log(`API running on port ${port}\nWaiting for requests...`);
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
    console.log(`${requestReceived.toUTCString()}\tRequest received for: ${req.query.q} [${isResponseGood ? 'PASS' : 'FAIL'}] - ${requestSent - requestReceived}ms`)

    if (!isResponseGood) {
      console.warn(`${requestSent.toUTCString()}\t[WARN]Request made for ${airportsRequest}, but only ${airportsInfo.map(airport => airport["Station"])} returned.`)
    }

    res.json(airportsInfo)
  });
