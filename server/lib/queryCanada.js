const bodyParser = require('body-parser');
const artoo = require('artoo-js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const { logger } = require('./logger');

const airportsData = require('../airports.json');

artoo.bootstrap(cheerio);

/*  Makes a request to NAV Canada for the specified station METAR webpage. Then
    returns the METARs and TAFs as an object. */
const getMetarCanada = async stations => {

  const params = new URLSearchParams({
    NoSession: 'NS_Inconnu',
    Stations: stations.join(' '),
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
  const stationNameParser = 'body > h2' // [style="text-align: left;"]
  const metarParser = 'body > p'
  const tafParser = 'body > font' // [style="font-family: ARIAL; font-size: small;"]
  const errorParser = 'FONT:contains("Invalid or unknown aerodrome ID")'

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    const $ = await cheerio.load(body);

    const error = await $(errorParser).scrape('text');
    const errorExists = error.length > 0 ? true : false;

    if (errorExists) {
      return { ERROR: 'Invalid ICAO identifier' }
    }

    const taf_reg = /\n\s*(?=FM\d{6}|RMK|PROB)/

    const stationName = await $(stationNameParser).scrape('text');
    const metarData = await $(metarParser).scrape('html');
    const tafData = await $(tafParser).scrape('text');

    const metars = await Promise.all(metarData.map(async metar => {
      const $ = await cheerio.load(metar);
      return await $('div').scrape('text').map(metar => metar.slice(1, metar.indexOf('=')))
    }))

    const metarInfo = {}
    stationName.forEach((name, index) => {
      metarInfo[ stations[ index ] ] = {
        stationName: name.trimEnd(),
        metar: metars[ index ],
        taf: tafData[ index ].slice(1, tafData[ index ].indexOf('=')).split(taf_reg)
      }
    })

    return metarInfo
  } catch (err) {
    logger(`GetMetarData: ${ err }`)
    return null
  }
}

/*  Makes a request to NAV Canada for the specified station NOTAM webpage. Then
    returns the NOTAMs as an object. */
const getNotamCanada = async stations => {
  const params = new URLSearchParams({
    Langue: 'anglais',
    TypeBrief: 'N',
    NoSession: 'NS_Inconnu',
    Stations: stations.join(' '),
    Location: '',
    ni_File: 'on',
    ni_FIR: 'on',
    ni_CZNB: 'on',
    ni_HQ: 'on'
  })

  const options = {
    method: 'POST',
    body: params
  };

  const url = 'https://flightplanning.navcanada.ca/cgi-bin/Fore-obs/notam.cgi'
  // this is the query for all notam products
  const FullNotamParser = '#notam_all_whole_section'
  // this is the query to separate the types of notam requested.
  const notamSectionParser = '#notam_title_whole_section'
  // this is the query to separate the stations within the types of notams
  const notamStationParser = '#notam_station_whole_section'
  // this is the query to get all station's NOTAM bulletin:
  const notamBulletinParser = '#notam_bulletin'

  let body
  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    body = await response.text()
  } catch (err) {
    logger(`GetNotamData: ${ err }`)
    return null
  }

  try {
    const $ = await cheerio.load(body);
    const notamTypesSections = await $(notamSectionParser).scrape('html');

    const data = new Object()
    for (const notamSection of notamTypesSections) {
      const $ = await cheerio.load(notamSection)
      const notamType = await $('#notam_print_item').scrapeOne('text');
      const notamStationsBlock = await $(notamStationParser).scrape('html');

      const notamBulletins = new Object()
      for (const notamStationBlock of notamStationsBlock) {
        const $ = await cheerio.load(notamStationBlock)
        const stationName = await $('#notam_print_item').scrapeOne('text');
        const notamBulletin = await  $(notamBulletinParser).scrape('text').map(notam => {
          // add a filter for extra '\n' that cause impromptu line return
          const trimmedNotam = notam.substring(1, notam.length - 1)
          // split title and bulletin into two field.
          const titleEnd = trimmedNotam.indexOf('\n')
          return {
            title: trimmedNotam.slice(1, titleEnd),
            notam: trimmedNotam.slice(titleEnd + 1, trimmedNotam.length - 1)
          }
        })

        notamBulletins[ stationName.slice(2, stationName.length - 1) ] = notamBulletin
      }
      data[ notamType.slice(3, notamType.length - 1) ] = notamBulletins
    }

    return data
  } catch (err) {
    logger(`GetNotamData: ${ err }`)
  }
}

/*  Makes a request to NAV Canada for the specified station RVR webpage. Then
    returns the RVR image link as an object */
const getRvrCanada = async stations => {
  const baseURL = 'http://atm.navcanada.ca'
  const rvrParser = 'img[alt="Aerodrome chart"]'
  const airportsRVR = new Object()

  await Promise.all(stations.map(async station => {
    try {
      const response = await fetch(baseURL + '/atm/iwv/' + station)
      const body = await response.text()
      const $ = await cheerio.load(body);
      const data = await $('img[alt="Aerodrome chart"]').scrapeOne('src');

      const RVR = data === undefined ? { rvr: null } : { rvr: baseURL + data }
      airportsRVR[ station ] = RVR
    } catch (err) {
      logger(`GetRVRData: ${ err }`)
      return null
    }
  }))

  return airportsRVR
}

const getCanadianAirports = async stations => {
  if (stations.canada.length > 0) {
    try {
      const metars = await getMetarCanada(stations.canada)
      const notams = await getNotamCanada(stations.canada)
      const rvr = await getRvrCanada(stations.canada)

      const airportInfo = new Object()

      stations.canada.forEach(airport => {
        airportInfo[ airport ] = {
          ...metars[ airport ],
          notam: notams[ 'Aerodrome NOTAM file' ][ airport ],
          fir: notams[ 'FIR (Flight Information Region) NOTAM file' ][ airportsData[ airport ].FIR ],
          rvr: rvr[ airport ].rvr
        }
      })

      airportInfo[ 'other_notam' ] = {
        'CZNB': notams[ 'CZNB NOTAM file' ][ 'CZNB' ] ? notams[ 'CZNB NOTAM file' ][ 'CZNB' ] : null,
        'national': notams[ 'National NOTAM file' ][ 'CYHQ' ] ? notams[ 'National NOTAM file' ][ 'CYHQ' ] : null
      }

      return airportInfo
    } catch (err){
      throw err
    }

  } else {
    return null
  }
}

module.exports.getCanadianAirports = getCanadianAirports;
