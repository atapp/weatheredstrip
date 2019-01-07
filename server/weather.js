const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const artoo = require("artoo-js");
const cheerio = require('cheerio');

artoo.bootstrap(cheerio);

function getMetar(station, callback) {
  const options = {
    method: 'POST',
    url: 'https://flightplanning.navcanada.ca/cgi-bin/Fore-obs/metar.cgi',
    headers: { 'cache-control': 'no-cache' },
    form: {
      NoSession: 'NS_Inconnu',
      Stations: station,
      format: 'raw',
      Langue: 'anglais',
      Region: 'can',
      Location: ''
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    // scrapping for METAR itself.
    let $ = cheerio.load(body);
    const data = $('div[style="text-indent:-1.5em;margin-left:1.5em"]').scrape('text');

    metar = data.map(daton => daton.slice(1, daton.indexOf('=')))

    // 're' is a regex to strip the correct line returns from the inline TAF info
    const re = /\n\s*(?=BECMG|FM\d{6}|RMK)/
    const taf = metar.pop().split(re)

    callback({METAR: metar, TAF: taf})
  });
}

function getRVR(station, callback) {
  const baseURL = 'http://atm.navcanada.ca'
  const options = {
    method: 'GET',
    url: baseURL + '/atm/iwv/' + station,
    headers: {
      'cache-control': 'no-cache',
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    let $ = cheerio.load(body);
    const url = $('img[alt="Aerodrome chart"]').scrapeOne('src');
    callback({ RVR: baseURL + url })
  });
}

function getNotam(station, callback) {
  const options = {
    method: 'POST',
    url: 'https://flightplanning.navcanada.ca/cgi-bin/Fore-obs/notam.cgi',
    headers: {
      'cache-control': 'no-cache',
    },
    form: {
      Langue: 'anglais',
      TypeBrief: 'N',
      NoSession: 'NS_Inconnu',
      Stations: station,
      Location: '',
      ni_File: 'on'
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    let $ = cheerio.load(body);
    let data = $('#notam_print_item > pre').scrape('text');
    let notams = data.map(notam => {
      // add a filter for extra '\n' that cause impromptu line return
      const trimmedNotam = notam.substring(1, notam.length - 2)
      const titleEnd = trimmedNotam.indexOf("\n")
      return {
        title: trimmedNotam.slice(0, titleEnd),
        notam: trimmedNotam.slice(titleEnd + 1)
      }
    })
    callback({ NOTAM: notams })
  });
}

function getInfo(airport, callback) {
  getNotam(airport, res1 => {
    getMetar(airport, res2 => {
      getRVR(airport, res3 => {
        callback({
          Station: airport.toUpperCase(),
          Timestamp: new Date(),
          ...res1,
          ...res2,
          ...res3
        })
      })
    })
  })
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
  res.json({ message: 'API Initialized!'});
});
app.use('/', router);
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});

router.route('/airport')
  .get(function(req, res) {
    console.log(`A request was made for : ${req.query}`)
    getInfo(req.query.q, data => {
      res.json(data)
    })
  });
