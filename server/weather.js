const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const artoo = require("artoo-js");
const cheerio = require('cheerio');

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

artoo.bootstrap(cheerio);

const getMetar = async function(station) {
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
    console.log('Sending METAR request...')
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $(MetarParser).scrape('text');

    // trim whitespace at 0 and remove '=' at the end of each line
    const metar = await data.map(daton => daton.slice(1, daton.indexOf('=')))

    // A regex to strip the correct line returns from the inline TAF info
    const re = /\n\s*(?=BECMG|FM\d{6}|RMK)/
    const taf = await metar.pop().split(re)
    console.log('METAR parsed.')
    return { METAR: metar, TAF: taf }
  } catch (err) {
    console.log(err)
    return null
  }
}

const getRVR = async function (station) {
  const baseURL = 'http://atm.navcanada.ca'
  const rvrParser = 'img[alt="Aerodrome chart"]'
  try {
    console.log('Sending RVR request...')
    const response = await fetch(baseURL + '/atm/iwv/' + station)
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $('img[alt="Aerodrome chart"]').scrapeOne('src');

    const RVR = data === undefined ? { RVR: null } : { RVR: baseURL + data }
    console.log('RVR parsed.')
    return RVR
  } catch (err) {
    console.log(err)
    return null
  }

  // request(options, function (error, response, body) {
  //   if (error) throw new Error(error);
  //   let $ = cheerio.load(body);
  //   const url = $('img[alt="Aerodrome chart"]').scrapeOne('src');
  //   callback(url === undefined ? { RVR: null } : { RVR: baseURL + url })
  // });
}

const getNotam = async function(station, callback) {
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
    console.log('Sending NOTAM request...')
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    let $ = await cheerio.load(body);
    const data = await $(NotamParser).scrape('text');

    const notams = await data.map(notam => {
      // add a filter for extra '\n' that cause impromptu line return
      const trimmedNotam = notam.substring(1, notam.length - 2)
      const titleEnd = trimmedNotam.indexOf("\n")
      return {
        title: trimmedNotam.slice(0, titleEnd),
        notam: trimmedNotam.slice(titleEnd + 1)
      }
    })
    console.log('NOTAM parsed.')
    return ({ NOTAM: notams })
  } catch (err) {
    console.log(err)
    return null
  }
}

const getInfo = async function(airport) {
  const airportInfo = {
    ...await getMetar(airport),
    ...await getNotam(airport),
    ...await getRVR(airport),
    Station: airport.toUpperCase(),
    Timestamp: new Date()
  }

  return airportInfo
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

  //and remove cacheing so we get the most recent genes
  res.setHeader('Cache-Control', 'no-cache');
  next();
});
router.get('/', function(req, res) {
  res.json({ message: 'API currently running, please use "/airport" to access the data!'});
});
app.use('/', router);
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});

router.route('/airport')
  .get(async function(req, res) {
    const timestamp = new Date()

    console.log(`${timestamp}: \t A request was made for : ${req.query.q}`)
    const airportInfo = await getInfo(req.query.q)
    console.log(airportInfo)
    res.json(airportInfo)
  });
