const { logger } = require('../lib/logger');
const { getIntlAirports } = require('../lib/queryIntl');
const { getCanadianAirports } = require('../lib/queryCanada');
const worldAirportData = require('../world-airports.json')

/*  Request all reports from all the get[...] functions. Then returns a
    consolidated object. */
getAirports = async airports => {
  let flightPlanInfo = new Object()
  const [intlAirports, canAirports] = await Promise.all([getIntlAirports(airports), getCanadianAirports(airports)])

  airports.canada.forEach(airport => {
    flightPlanInfo[airport.icao_code] = canAirports[airport.icao_code]
  })

  airports.intl.forEach(airport => {
    flightPlanInfo[airport.icao_code] = intlAirports[airport.icao_code]
  })

  if (canAirports) {
    flightPlanInfo['other_notam'] = { ...canAirports['other_notam'], ...intlAirports['other_notam'] }
  } else {
    flightPlanInfo['other_notam'] = { ...intlAirports['other_notam'] }
  }
  flightPlanInfo.Timestamp = new Date()
  return flightPlanInfo
}

/*  Transform the provided array into a list containing a Promises for each
    airport.  */
const getInfo = async airports => {
  const validAirports = airports.map(airport => {
    airportData = worldAirportData.filter(item => item.icao_code === airport || item.iata_code === airport)[0]
    if (airportData) {
      return airportData
    } else {
      return null
    }
  })
  const intlAirports = validAirports.filter(airport => airport.iso_country !== 'CA')
  const canadianAirports = validAirports.filter(airport => airport.iso_country === 'CA')

  return await getAirports({ intl: intlAirports, canada: canadianAirports })
}

module.exports = function airport() {
  return async function (req, res) {
    // Mark a time
    const requestReceived = new Date();
    let isResponseGood = false;
    let airportsRequest = req.query.q.split(/(\s|,)/).filter(item => item !== " " && item !== ",");
    airportsRequest = airportsRequest.map(airport => airport.toUpperCase())
    const airportsInfo = await getInfo(airportsRequest);

    isResponseGood = true;
    const requestSent = new Date();
    logger(`Request received for: ${req.query.q} [${isResponseGood ? 'PASS' : 'FAIL'}] - ${requestSent - requestReceived}ms - IP: ${req.headers['x-forwarded-for']}`);
    if (!isResponseGood) {
      logger(`[WARN]Request made for ${airportsRequest}, but only ${airportsInfo.map(airport => airport["Station"])} returned.`);
    }
    res.json(airportsInfo);
  };
}
