const { logger } = require('../lib/logger');
const { getIntlAirports } = require('../lib/queryIntl');
const { getCanadianAirports } = require('../lib/queryCanada');

/*  Request all reports from all the get[...] functions. Then returns a
    consolidated object. */
getAirports = async airports => {
  let flightPlanInfo = new Object()
  const intlAirports = await getIntlAirports(airports)
  const canAirports = await getCanadianAirports(airports)

  airports.canada.forEach(airport => {
    flightPlanInfo[airport] = canAirports[airport]
  })

  airports.intl.forEach(airport => {
    flightPlanInfo[airport] = intlAirports[airport]
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

  const validAirports = airports.filter(airport => airport.length === 4)
  const intlAirports = validAirports.filter(icao => icao.slice(0, 2) !== "CY" && icao.slice(0, 2) !== "CZ")
  const canadianAirports = validAirports.filter(icao => icao.slice(0, 2) === "CY" || icao.slice(0, 2) === "CZ")

  return await getAirports({ intl: intlAirports, canada: canadianAirports })
}

module.exports = function airport() {
  return async function (req, res) {
    // Mark a time
    const requestReceived = new Date();
    let isResponseGood = false;
    const airportsRequest = req.query.q.split(/(\s|,)/).filter(item => item !== " " && item !== ",");
    const airportsInfo = await getInfo(airportsRequest);

    // Ensure requested number of items are all present in the report.
    // if (airportsInfo.length === airportsRequest.length) {
    //   isResponseGood = true;
    // }
    isResponseGood = true;
    const requestSent = new Date();
    logger(`Request received for: ${req.query.q} [${isResponseGood ? 'PASS' : 'FAIL'}] - ${requestSent - requestReceived}ms - IP: ${req.headers['x-forwarded-for']}`);
    if (!isResponseGood) {
      logger(`[WARN]Request made for ${airportsRequest}, but only ${airportsInfo.map(airport => airport["Station"])} returned.`);
    }
    res.json(airportsInfo);
  };
}
