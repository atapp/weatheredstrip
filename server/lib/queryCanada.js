const bodyParser = require('body-parser');
const artoo = require("artoo-js");
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

artoo.bootstrap(cheerio);

/*  Makes a request to NAV Canada for the specified station METAR webpage. Then
    returns the METARs and TAFs as an object. */
const getMetarCanada = async station => {
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
  const metarParser = 'div[style="text-indent:-1.5em;margin-left:1.5em"]'
  const errorParser = 'FONT:contains("Invalid or unknown aerodrome ID")'

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    let $ = await cheerio.load(body);
    const error = await $(errorParser).scrape('text');
    const errorExists = error.length > 0 ? true : false;

    if (errorExists) {
      return { ERROR: "Invalid ICAO identifier" }
    }

    const data = await $(metarParser).scrape('text');

    // trim whitespace at 0 and remove '=' at the end of each line
    const metar = await data.map(daton => daton.slice(1, daton.indexOf('=')))

    // A regex to strip the correct line returns from the inline TAF info
    const re = /\n\s*(?=BECMG|FM\d{6}|RMK|PROB)/
    const taf = await metar.pop().split(re)
    return { METAR: metar, TAF: taf }
  } catch (err) {
    logger(err)
    return null
  }
}

/*  Makes a request to NAV Canada for the specified station NOTAM webpage. Then
    returns the NOTAMs as an object. */
const getNotamCanada = async station => {
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

    const errorExists = data[0].indexOf('INVALID IDENTIFIER') > 0 ? true : false;

    if (errorExists) {
      return { ERROR: "Invalid ICAO identifier" }
    }

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
    logger(err)
    return null
  }
}

/*  Makes a request to NAV Canada for the specified station RVR webpage. Then
    returns the RVR image link as an object */
const getRvrCanada = async station => {
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
    logger(err)
    return null
  }
}

module.exports.getMetarCanada = getMetarCanada;
module.exports.getNotamCanada = getNotamCanada;
module.exports.getRvrCanada = getRvrCanada;
