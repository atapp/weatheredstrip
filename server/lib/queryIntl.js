const artoo = require('artoo-js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const xmlParser = require('xml2json');
const { get, set } = require('./redis')

const { logger } = require('./logger')
const airportsData = require('../world-airports.json')

const NOTAM_TTL = process.env.NOTAM_TTL || 60;

artoo.bootstrap(cheerio);

const getMetarIntl = async stations => {
  if (stations.length === 0) {
    return null;
  }

  baseURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${ stations.join('%20') }&hoursBeforeNow=4`;

  try {
    const response = await fetch(baseURL)
    if (response.ok) {
      const xml = await response.text()
      const stringMetars = await xmlParser.toJson(xml)
      const json = await JSON.parse(stringMetars).response;
      const metars = json.data.METAR

      const airports = new Object()
      stations.forEach(airport => {
        airports[ airport ] = []
        metars.forEach(metar => {
          if (metar.station_id === airport) {
            airports[ airport ].push(metar.metar_type + ' ' + metar.raw_text )
          }
        })
        if (airports[ airport ].length === 0) {
          airports[ airport ].push(`Error: ${ airport } could not be found.`)
        }
      })
      return airports
    }
  } catch (err) {
    logger(`getMetarIntl: ${ err }`)
    return null
  }
}

const getTafIntl = async stations => {
  if (stations.length === 0) {
    return null;
  }
  
  baseURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&stationString=${ stations.join('%20') }&hoursBeforeNow=0`;

  try {
    const response = await fetch(baseURL)
    if (response.ok) {
      const xml = await response.text()
      const stringTafs = await xmlParser.toJson(xml)
      const json = await JSON.parse(stringTafs).response;
      const tafs = json.data.TAF
      const re = /\s*(?=FM\d{6}|RMK|PROB)/

      const airports = new Object()
      stations.forEach(airport => {
        airports[ airport ] = []
        tafs.forEach(taf => {
          if (taf.station_id === airport) {
            airports[ airport ].push(taf.raw_text )
          }
        })
        if (airports[ airport ].length === 0) {
          airports[ airport ].push(`Error: ${ airport } could not be found.`)
        } else {
          airports[ airport ] = airports[ airport ][ 0 ].split(re)
        }
      })
      return airports
    }

  } catch (err) {
    logger(`getTafIntl: ${ err }`)
    return null
  }
}

const requestNotam = async (stations, offset = 0) => {
  const url = 'https://notams.aim.faa.gov/notamSearch/search'
  const params = new URLSearchParams({
    searchType: 0,
    designatorsForLocation: stations.join(','),
    latMinutes: 0,
    latSeconds: 0,
    longMinutes: 0,
    longSeconds: 0,
    radius: 10,
    sortColumns: '5 false',
    sortDirection: true,
    radiusSearchOnDesignator: false,
    latitudeDirection: 'N',
    longitudeDirection: 'W',
    flightPathBuffer: 4,
    flightPathIncludeNavaids: true,
    flightPathIncludeArtcc: false,
    flightPathIncludeTfr: true,
    flightPathIncludeRegulatory: false,
    flightPathResultsType: 'All NOTAMs',
    offset: offset,
    notamsOnly: false
  })

  try {
    response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return response.json();
    // get all content by adding offset.
  } catch (err) {
    console.error(err)
  }
}

const getNotamIntl = async stations => {
  const stationsToSearch = []
  const stationsCached = {}
  stations.push('KGPS')

  await Promise.all(stations.map(async station => {
    const res = await get(`notamsIntl:${ station }`)
    if (res === null) {
      stationsToSearch.push(station)
    } else {
      stationsCached[ station ] = JSON.parse(res)
    }
  }))

  try {
    const airports = new Object()
    if (stationsToSearch.length !== 0) {
      let body = await requestNotam(stationsToSearch);
      if (body.error) {
        const errorIndices = []
        stationsToSearch.forEach((station, index) => {
          if (station.indexOf(body.error) >= 0) {
            errorIndices.push(index)
          }
        })

        errorIndices.forEach(index => {
          stationsToSearch.splice(index, 1)
        })
      }
      let notams = body.notamList

      let currentNumberNotam = 0
      const totalNumberNotam = body.totalNotamCount;

      stationsToSearch.forEach(station => {
        airports[ station ] = []
      })

      while (currentNumberNotam < totalNumberNotam) {
        if (currentNumberNotam != 0) {
          body = await requestNotam(stationsToSearch, currentNumberNotam)
          notams = body.notamList
        }
        stationsToSearch.forEach(airport => {
          notams.forEach(notam => {
            if (notam.icaoId === airport || notam.facilityDesignator === airport) {
              const re = new RegExp('\\s(?=' + notam.facilityDesignator + ')', 'g')
              const splits = notam.traditionalMessage.search(re)

              if (notam.traditionalMessage !== ' ') {
                // North american airport do not have icaoMessage
                let title
                let notamText
                if (notam.comment) {
                  title = notam.traditionalMessage
                  notamText = null
                } else {
                  title = notam.traditionalMessage.slice(0, splits)
                  notamText = notam.traditionalMessage.slice(splits + 1)
                }

                airports[ airport ].push({
                  title: title,
                  notam: notamText,
                  link: notam.comment
                })
              } else {
                // International airport following ICAO stds does have icaoMessage
                airports[ airport ].push({
                  title: notam.icaoMessage.slice(0, notam.icaoMessage.indexOf('\n')),
                  notam: notam.icaoMessage.slice(notam.icaoMessage.indexOf('\n') + 1),
                  link: notam.comment
                })
              }
            }
          })
        })
        currentNumberNotam += notams.length
      }
      const results = Object.keys(airports).map(async key => {
        await set(`notamsIntl:${ key }`, JSON.stringify(airports[ key ]), 'EX', NOTAM_TTL)
      })
      Promise.all(results)
    }

    const results = Object.assign({}, airports, stationsCached)
    // Moving KGPS under other_notam
    results[ 'other_notam' ] = {
      'KGPS': results[ 'KGPS' ]
    }
    delete results.KGPS

    return results
  } catch (err) {
    console.error(`getNotamIntl: ${ err }`)
  }
}

const getIntlAirports = async stations => {
  const searchables = []
  stations.intl.forEach(station => {
    searchables.push(station.icao_code)
    if (station && searchables.indexOf(station.FIR) < 0) {
      searchables.push(station.FIR)
    }
  })

  let metars
  let tafs
  if (stations.intl) {
    stations_ICAO = stations.intl.map(airport => airport.icao_code)
    metars = await getMetarIntl(stations_ICAO)
    tafs = await getTafIntl(stations_ICAO)
  }
  const notams = await getNotamIntl(searchables)

  const airportsInfo = new Object()
  console.log(notams)

  stations.intl.forEach(station => {
    airportsInfo[ station.icao_code ] = {
      metar: metars[ station.icao_code ],
      taf: tafs[ station.icao_code ],
      notam: notams[ station.icao_code ],
      fir: notams[ station.FIR ]
    }
  })

  airportsInfo[ 'other_notam' ] = { ...notams.other_notam }
  return airportsInfo
}

module.exports.getIntlAirports = getIntlAirports
