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

  // Parser the station Names
  const stationNameParser = 'body > h2'

  // Parser for a block containing metars <table />
  const metarParser = 'body > p'

  // Parser for a block containing all TAF lines separated by <br />
  const tafParser = 'body > font'

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    const body = await response.text()
    const $ = await cheerio.load(body);

    const taf_reg = /\n\s*(?=FM\d{6}|RMK|PROB)/

    // Scrape all lines related to the metar and taf info.
    const stationName = await $(stationNameParser).scrape('text');
    const metarData = await $(metarParser).scrape('html');
    const tafData = await $(tafParser).scrape('text');

    const cleanedMetars = metarData.filter(item => item.indexOf('No TAF') < 0)

    const metars = await Promise.all(cleanedMetars.map(async metar => {
      // Goes through each <div /> within the metars table.
      const $ = await cheerio.load(metar);
      return await $('div').scrape('text').map(metar => metar.slice(1, metar.indexOf('=')))
    }))

    const newTafArray = new Array(cleanedMetars.length)

    /* Replicate the tafData into the same length as metarData
       while keepin the same relations to indexes. */

    let tafDataIndex = 0
    cleanedMetars.forEach((metarBlock, index) => {
      if (metarBlock.indexOf('No METAR') < 0) {
        newTafArray[index] = tafData[tafDataIndex]
        tafDataIndex++
      } else {
        newTafArray[index] = null
      }
    })

    const metarInfo = {}
    stationName.forEach((name, index) => {
      metarInfo[ stations[ index ] ] = {
        stationName: name.trimEnd(),
        metar: metars[ index ],
        taf: newTafArray[index] ? newTafArray[ index ].slice(1, newTafArray[ index ].indexOf('=')).split(taf_reg) : []
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

  const firs = ['CZUL', 'CZEG', 'CZQM', 'CZQX', 'CZVR', 'CZWG', 'CZYZ']
  const otherStations = ['CZNB', 'CYHQ']

  let body;

  try {
    const response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    body = await response.text()
  } catch (err) {
    logger(`GetNotamData: ${ err }`)
    return null
  }

  let allStations = stations.slice() // Unlinked-copy of stations

  try {
    const $ = await cheerio.load(body);
    const notamTypesSections = await $(notamSectionParser).scrape('html');

    const data = new Object()

    // for ... of is used instead of a forEach because of the asyncronous nature of this loop. Prevents the use of Promise.all(array.map(...))
    for (const notamSection of notamTypesSections) {
      const $ = await cheerio.load(notamSection)
      const notamType = await $('#notam_print_item').scrapeOne('text').trim();
      const notamStationsBlock = await $(notamStationParser).scrape('html');

      const notamBulletins = new Object()
      for (const notamStationBlock of notamStationsBlock) {
        const $ = await cheerio.load(notamStationBlock)

        const notamBulletin = await $(notamBulletinParser).scrape('text').map(notam => {
          // add a filter for extra '\n' that cause impromptu line return
          const trimmedNotam = notam.trim()
          // split title and bulletin into two field.
          const titleEnd = trimmedNotam.indexOf('\n')
          return {
            title: trimmedNotam.slice(0, titleEnd),
            notam: trimmedNotam.slice(titleEnd + 1, trimmedNotam.length)
          }
        })


        let stationName = await $('#notam_print_item').scrapeOne('text').trim();
        if (
          notamType === 'Aerodrome NOTAM file' &&
          firs.indexOf(stationName) < 0 &&
          otherStations.indexOf(stationName) < 0
          ) {
          allStations.forEach(station => {
            if (station !== stationName) {
              notamBulletin.forEach(notam => {
                if (notam.notam.indexOf(station) >= 0) {
                  notamBulletins[ station ] = notamBulletin
                }
              })
            } else {
              notamBulletins[ stationName ] = notamBulletin
            }
          })
        } else {
          notamBulletins[ stationName ] = notamBulletin
        }
      }
      data[ notamType ] = notamBulletins
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

const separateLocalAndArea = (notams) => {
  notams[ 'Area NOTAM' ] = {}
  const notamFile = notams[ 'Aerodrome NOTAM file' ]
  Object.keys(notamFile).forEach(station => {
    const currentNotams = notamFile[station]
    const stationNotams = currentNotams.filter(notam => {
      return notam.notam.slice(0, 4) === station ? true : false
    })
    const areaNotams = currentNotams.filter(notam => {
      return notam.notam.slice(0, 4) === station ? false : true
    })
    notams[ 'Aerodrome NOTAM file' ][station] = stationNotams
    notams[ 'Area NOTAM' ][station] = areaNotams
  })
}

const getCanadianAirports = async stations => {
  if (stations.canada.length > 0) {
    try {
      stations_ICAO = stations.canada.map(airport => airport.icao_code)
      const metars = await getMetarCanada(stations_ICAO)
      const notams = await getNotamCanada(stations_ICAO)
      const rvr = await getRvrCanada(stations_ICAO)

      separateLocalAndArea(notams)

      let airportInfo = new Object()

      stations_ICAO.forEach(airport => {
        if (notams[ 'Aerodrome NOTAM file' ][airport][0].title === "INVALID IDENTIFIER, PLEASE VERIFY AND TRY AGAIN.") {
          airportInfo[ airport ] = {
            metars: null,
            notam: null,
            fir: null,
            rvr: null,
            ERROR: "Invalid Identifier"
          }
        } else {
          airportInfo[ airport ] = {
            ...metars[ airport ],
            notam: notams[ 'Aerodrome NOTAM file' ][ airport ],
            fir: airportsData[ airport ] ? notams[ 'FIR (Flight Information Region) NOTAM file' ][ airportsData[ airport ].FIR ] : [],
            area: notams[ 'Area NOTAM'][airport],
            rvr: rvr[ airport ].rvr
          }
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
