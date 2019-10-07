const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const { logger } = require('./logger');

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

const formatTAF = taf => {
  const re = /\s*(?=FM\d{6}|RMK|PROB)/
  newTAF = {...taf[0]}
  newTAF.text = taf[0].text.replace('=', '').replace(/\s{6}/g, ' ').substring(0,taf[0].text.length - 1).split(re)
  return newTAF
}

const formatMETAR = metar => {
  newMETAR = [...metar]
  newMETAR = newMETAR.map(metar => {
    metar.text = metar.text.replace('=', '')
    return metar
  })

  return newMETAR
}

const getCanadianAirports = async stations => {
  if (stations.canada.length > 0) {
    try {
      stations_ICAO = stations.canada.map(airport => airport.icao_code)
      points = stations.canada.map(airport => `point=${airport.longitude_deg},${airport.latitude_deg},${airport.icao_code},site`)
      url = `https://plan.navcanada.ca/weather/api/alpha/?${points.join('&')}&alpha=sigmet&alpha=airmet&alpha=notam&alpha=metar&alpha=taf&alpha=pirep&alpha=upperwind&alpha=vfr_route&image=GFA/CLDWX&image=GFA/TURBC&image=TURBULENCE&image=LOW_LEVEL_WIND/FL030&image=LOW_LEVEL_WIND/FL060&image=LOW_LEVEL_WIND/FL090&image=LOW_LEVEL_WIND/FL120&image=LOW_LEVEL_WIND/FL180&image=HIGH_LEVEL_WIND/FL_240&image=HIGH_LEVEL_WIND/FL_340&image=HIGH_LEVEL_WIND/FL390&image=HIGH_LEVEL_WIND/FL450&metar_historical_hours=3`
      try {
        //TODO: Catch request errors
        const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        const res_json = await response.json()

        let airportInfo = new Object()

        stations.canada.forEach(station => {
          allNotams = res_json.data.filter(res_item => res_item.type === 'notam' && res_item.pointReference === station.icao_code).map(notam => {
            title = notam.text.substring(0, notam.text.indexOf('\n'))
            text = notam.text.substring(notam.text.indexOf('\n') + 1).replace(/\r|\n/g,
            ' ')
            type = notam.location === notam.pointReference ? 'aerodrome' : title.indexOf(station.icao_code) > 0 ? 'area' : title.indexOf('CYHQ') > 0 ? 'national' : 'FIR'
            return {
              type: type,
              startValidity: notam.startValidity,
              title: title,
              notam: text,
              radialDistance: notam.radialDistance
            }
          })

          en_notam_regex = /^\d{6} /g
          fr_notam_regex = /^\d{6}F /g

          const taf = formatTAF(res_json.data.filter(res_item => res_item.type === 'taf'))

          const metar = formatMETAR(res_json.data.filter(res_item => res_item.type === 'metar'))

          airportInfo[station.icao_code] = {
            ...station,
            notam_EN: allNotams.filter(notam => en_notam_regex.test(notam.title)),
            notam_FR: allNotams.filter(notam => fr_notam_regex.test(notam.title)),
            metar: metar,
            taf: taf,
          }
        })
        return airportInfo
      } catch (err) {
        logger(`GetData: ${ err }`)
        return null
      }

      // const rvr = await getRvrCanada(stations_ICAO)
    } catch (err){
      throw err
    }

  } else {
    return null
  }
}

module.exports.getCanadianAirports = getCanadianAirports;
