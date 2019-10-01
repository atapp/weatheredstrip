#!/usr/bin/env node

const fs = require("fs"),
      world = require("./world.json"),
      airports = require("../airports.json")
      topojson = require("topojson-client"),
      turf = require("@turf/turf")
      poligonize = require("@turf/polygonize")


const getCountryBounds = (country) => {
  const countryTopo = world.objects.countries.geometries.filter(x => x.properties.name === country)[0]
  return topojson.mesh(world, countryTopo)
}


const isAirportIn = (airport, polygon) => {
  airportData = Object.values(airports).filter(item => item['gps_code'] === airport.toUpperCase() || item['iata_code'] === airport.toUpperCase())[0]
  console.log(airportData)
  const turfPoly = poligonize(polygon)
  const coordinates = [airportData.longitude_deg, airportData.latitude_deg]
  const pointsWithin = turf.pointsWithinPolygon(turf.point(coordinates), turfPoly)
  return pointsWithin.features.length > 0
}

console.log(isAirportIn('CDG', getCountryBounds('France')))

