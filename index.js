const fs = require('fs');
const { gzip } = require('node-gzip');
const distance = require('@turf/distance').default;
const VPTreeFactory = require('vptree');
const csvParse = require('csv-parse/lib/sync');
const fetch = require('node-fetch');

// Precision for coordinates
const coord_precision = 4;

// parsing airports
const csvAirportContent = fs.readFileSync('./data/airport-codes.csv');
let airports = csvParse(csvAirportContent, {
  columns: true,
  skip_empty_lines: true
});
// small airports do not have an official iata code, easiest way to reduce the list
// airports = airports.filter((airport) => airport.iata_code && airport.iata_code.length === 3);
// if we want a smaller list, only keep large airports
airports = airports.filter((airport) => airport.type && airport.type === 'large_airport');

airports.forEach((airport) => {
  const coordinates = airport.coordinates.split(' ').map((coord) => parseFloat(coord));
  airport['geom'] = {
    type: 'Feature',
    properties: {},
    geometry:{
      type: 'Point',
      // airport coordinate sequence reversed
      coordinates: [coordinates[1], coordinates[0]]
    }
  };
});
const airportTree = VPTreeFactory.build(airports, (a, b) => distance(a.geom, b.geom));

// parsing postcodes
const csvPostcodeContent = fs.readFileSync('./data/postcode_centroids.csv');
let postcodes = csvParse(csvPostcodeContent, {
  columns: true,
  skip_empty_lines: true
});
// get large cities
const postcodes_large = postcodes.map((postcode) => parseInt(postcode.einwohner) > 100000);

// postcode processing
(async () => {
  // airport file
  const airports_zip = await gzip(airports.map((airport) => {
    return `${airport.iata_code},${(airport.name.indexOf(',') !== -1) ? `"${airport.name}"` : airport.name},${airport.geom.geometry.coordinates[0]},${airport.geom.geometry.coordinates[1]}`
  }).join('\n'));
  fs.writeFileSync('./output/airports.csv', airports_zip);

  // postcode validation file
  const postcode_zip = await gzip(postcodes.map((code) => code.plz.trim()).join(','));
  fs.writeFileSync('./output/postcodes.txt', postcode_zip);
  
  // individual postcode coordinates
  for (let i = 0; i < postcodes.length; i += 1) {
    // TODO: Based on population density generate travel profiles
    const airport = airports[airportTree.search({
      geom: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(postcodes[i].X), parseFloat(postcodes[i].Y)]
        }
      }
    })[0].i];

    // using the iata_code as a key (maybe use index of airport in file instead > no need for keymap in application?)
    const coordinates_zip = `${parseFloat(postcodes[i].X).toFixed(coord_precision)},${parseFloat(postcodes[i].Y).toFixed(coord_precision)},${airport.iata_code},"${postcode[i].city}"`;
    fs.writeFileSync(`./output/centroids/${postcodes[i].plz}.txt`, coordinates_zip);
  }
})();

// calculate co2 values for all postcode centroids to 
(async () => {
  const distances = {};
  // for each postcode we calculate the distance to all major cities
  for (let i = 0; i < postcodes.length; i += 1) {
    
  }
})();

fetch('https://httpbin.org/post', { method: 'POST', body: params })
    .then(res => res.json())
    .then(json => console.log(json));
fetch

http://localhost:8002/route --data '{"locations":[{"lat":52.444585,"lon":13.385928,"type":"break"},{"type":"break","lat":52.484527,"lon":13.386201}],"costing":"auto_co2","directions_options":{"units":"km", "directions_type":"none"}}' | jq '.'^C
