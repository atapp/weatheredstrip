const artoo = require("artoo-js");
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const xmlParser = require('xml2json');

const { logger } = require('./logger')
const airportsData = require('../airports.json')

artoo.bootstrap(cheerio);

const getMetarIntl = async stations => {
  baseURL = `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${stations.join("%20")}&hoursBeforeNow=4`;

  try {
    const response = await fetch(baseURL)
    if (response.ok) {
      const xml = await response.text()
      const stringMetars = await xmlParser.toJson(xml)
      const json = await JSON.parse(stringMetars).response;
      const metars = json.data.METAR

      let airports = new Object()
      stations.forEach(airport => {
        airports[airport] = []
        metars.forEach(metar => {
          if (metar.station_id === airport) {
            airports[airport].push(metar.metar_type + " " + metar.raw_text )
          }
        })
        if (airports[airport].length === 0) {
          airports[airport].push(`Error: ${airport} could not be found.`)
        }
      })
      return airports
    }
  } catch (err) {
    logger(`getMetarIntl: ${err}`)
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
      const tafs = json.data.TAF
      const re = /\s*(?=FM\d{6}|RMK|PROB)/

      let airports = new Object()
      stations.forEach(airport => {
        airports[airport] = []
        tafs.forEach(taf => {
          if (taf.station_id === airport) {
            airports[airport].push(taf.raw_text )
          }
        })
        if (airports[airport].length === 0) {
          airports[airport].push(`Error: ${airport} could not be found.`)
        } else {
          airports[airport] = airports[airport][0].split(re)
        }
      })
      return airports
    }

  } catch (err) {
    logger(`getTafIntl: ${err}`)
    return null
  }
}

const requestNotam = async (stations, offset = 0) => {
  const url = "https://notams.aim.faa.gov/notamSearch/search"
  const params = new URLSearchParams({
    searchType: 0,
    designatorsForLocation: stations.join(","),
    latMinutes: 0,
    latSeconds: 0,
    longMinutes: 0,
    longSeconds: 0,
    radius: 10,
    sortColumns: "5 false",
    sortDirection: true,
    radiusSearchOnDesignator: false,
    latitudeDirection: 'N',
    longitudeDirection: 'W',
    flightPathBuffer: 4,
    flightPathIncludeNavaids: true,
    flightPathIncludeArtcc: false,
    flightPathIncludeTfr: true,
    flightPathIncludeRegulatory: false,
    flightPathResultsType: "All NOTAMs",
    offset: offset,
    notamsOnly: false
  })

  try {
    response = await fetch(url, { method: 'POST', body: params, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return response.json();
    // get all content by adding offset.
  } catch (err) {
    console.log(err)
  }
}

const getNotamIntl = async stations => {
  try {
    const search =  [...stations, 'KGPS']
    let body = await requestNotam(search);
    if (body.error) {
      let errorIndices = []
      search.forEach((station, index) => {
        if (station.indexOf(body.error) >= 0) {
          errorIndices.push(index)
        }
      })

      errorIndices.forEach(index => {
        search.splice(index, 1)
      })
    }
    let notams = body.notamList

    let currentNumberNotam = 0
    const totalNumberNotam = body.totalNotamCount;
    let airports = new Object()

    search.forEach(station => {
      airports[station] = []
    })

    while (currentNumberNotam < totalNumberNotam) {
      if (currentNumberNotam != 0) {
        body = await requestNotam(search, currentNumberNotam)
        notams = body.notamList
      }
      search.forEach(airport => {
        notams.forEach(notam => {
          if (notam.icaoId === airport || notam.facilityDesignator === airport) {
            const re = new RegExp("\\s(?=" + notam.facilityDesignator + ")", "g")
            const splits = notam.traditionalMessage.search(re)

            debugger;
            if (notam.traditionalMessage !== " ") {
              // North american airport do not have icaoMessage
              airports[airport].push({
                title: notam.traditionalMessage.slice(0, splits),
                notam: notam.traditionalMessage.slice(splits + 1)
              })
            } else {
              // International airport following ICAO stds does have icaoMessage
              airports[airport].push({
                title: notam.icaoMessage.slice(0, notam.icaoMessage.indexOf('\n')),
                notam: notam.icaoMessage.slice(notam.icaoMessage.indexOf('\n') + 1)
              })
            }
          }
        })
      })
      currentNumberNotam += notams.length
    }

    airports["other_notam"] = {
      "KGPS": airports["KGPS"]
    }

    delete airports.KGPS
    return airports
  } catch (err) {
    console.log(`getNotamIntl: ${err}`)
  }
}

const getIntlAirports = async stations => {
  let searchables = [...stations.intl]
  stations.intl.forEach(airport => {
    if (searchables.indexOf(airportsData[airport].FIR) < 0) {
      searchables.push(airportsData[airport].FIR)
    }
  })

  let metars
  let tafs
  if (stations.intl) {
    metars = await getMetarIntl(stations.intl)
    tafs = await getTafIntl(stations.intl)
  }
  const notams = await getNotamIntl(searchables)

  let airportsInfo = new Object()

  stations.intl.forEach(airport => {
    if (airportsData[airport]) {
      airportsInfo[airport] = {
        metar: metars[airport],
        taf: tafs[airport],
        notam: notams[airport],
        fir: notams[airportsData[airport].FIR]
      }
    }
  })

  airportsInfo['other_notam'] = { ...notams.other_notam }
  return airportsInfo
}

module.exports.getIntlAirports = getIntlAirports
