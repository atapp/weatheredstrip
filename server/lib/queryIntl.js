const bodyParser = require('body-parser');
const artoo = require("artoo-js");
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const xmlParser = require('xml2json');

artoo.bootstrap(cheerio);

const getMetarIntl = async stations => {
  baseURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${stations.join("%20")}&hoursBeforeNow=4`;

  try {
    const response = await fetch(baseURL)
    if (response.ok) {
      const xml = await response.text()
      const stringMetars = await xmlParser.toJson(xml)
      const json = await JSON.parse(stringMetars).response;

      if (json.data.num_results === "0") {
        return { ERROR: "Invalid ICAO identifier." }
      }

      const metars = json.data.METAR.map(metar => { return metar.metar_type + " " + metar.raw_text })
      return { METAR: metars.slice(0, 4) }
    }
  } catch (err) {
    logger(err)
    return null
  }
}

const getTafIntl = async stations => {
  baseURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=${stations.join("%20")}&hoursBeforeNow=0`;

  try {
    const response = await fetch(baseURL)
    if (response.ok) {
      const xml = await response.text()
      const stringTafs = await xmlParser.toJson(xml)
      const json = await JSON.parse(stringTafs).response;

      if (json.data.num_results === "0") {
        return { ERROR: "Invalid ICAO identifier." }
      }

      const tafs = json.data.TAF.map(taf => { return taf.raw_text })

      const re = /\s*(?=BECMG|FM\d{6}|RMK|PROB)/
      const currentTaf = tafs.slice(0, 1)
      const outputTaf = currentTaf[0].split(re)
      return { TAF: outputTaf }
    }

  } catch (err) {
    logger(err)
    return null
  }
}

module.exports.getMetarIntl = getMetarIntl;
module.exports.getTafIntl = getTafIntl;
