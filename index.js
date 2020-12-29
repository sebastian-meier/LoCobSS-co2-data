const fs = require('fs');
const { gzip } = require('node-gzip');
const distance = require('@turf/distance').default;
const simplify = require('@turf/simplify').default;
const VPTreeFactory = require('vptree');
const csvParse = require('csv-parse/lib/sync');
const fetch = require('node-fetch');
const smooth = require('chaikin-smooth');

// Precision for coordinates
const coord_precision = 4;

// parsing mobility types
const mobilityContent = fs.readFileSync('./data/mobility-types.csv');
let mobilityData = csvParse(mobilityContent, {
  columns: true,
  skip_empty_lines: true
});
const mobilityTypes = {};
mobilityData.forEach((d) => {
  if (!(d.Regio5ID in mobilityTypes)) {
    mobilityTypes[d.Regio5ID] = {};
  }
  mobilityTypes[d.Regio5ID][d.traveltype] = {
    'd0to5': Math.round(parseFloat(d['0to5'])*100),
    'd5to20': Math.round(parseFloat(d['5to20'])*100),
    'd20to50': Math.round(parseFloat(d['20to50'])*100),
    'd50more': Math.round(parseFloat(d['50more'])*100)
  };
});

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
// parse coordinates
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
let csvPostcodeContent = fs.readFileSync('./data/postcode_centroids.csv');
let postcodes = csvParse(csvPostcodeContent, {
  columns: true,
  skip_empty_lines: true
});
// parse coordinates
postcodes.forEach((postcode) => {
  postcode.X = parseFloat(postcode.X);
  postcode.Y = parseFloat(postcode.Y);
});

// dissolved postcodes by city name > centroid
csvPostcodeContent = fs.readFileSync('./data/dissolved_postcodes.csv');
let postcodes_large = csvParse(csvPostcodeContent, {
  columns: true,
  skip_empty_lines: true
});
// parse coordinates and only keep cities bigger than 300000 inhabitants
postcodes_large = postcodes_large.filter((postcode) => parseInt(postcode.einwohner) > 300000);
postcodes_large.forEach((postcode) => {
  postcode.X = parseFloat(postcode.X);
  postcode.Y = parseFloat(postcode.Y);
});

// postcode processing
// (async () => {
//   // airport file
//   const airports_zip = await gzip(airports.map((airport) => {
//     return `${airport.iata_code},${(airport.name.indexOf(',') !== -1) ? `"${airport.name}"` : airport.name},${airport.geom.geometry.coordinates[0].toFixed(coord_precision)},${airport.geom.geometry.coordinates[1].toFixed(coord_precision)}`
//   }).join('\n'));
//   fs.writeFileSync('./output/airports.csv', airports_zip);

//   // postcode validation file
//   const postcode_zip = await gzip(postcodes.map((code) => code.plz.trim()).join(','));
//   fs.writeFileSync('./output/postcodes.txt', postcode_zip);
  
//   // individual postcode coordinates
//   for (let i = 0; i < postcodes.length; i += 1) {
//     // TODO: Based on population density generate travel profiles
//     const airport = airportTree.search({
//       geom: {
//         type: 'Feature',
//         properties: {},
//         geometry: {
//           type: 'Point',
//           coordinates: [postcodes[i].X, postcodes[i].Y]
//         }
//       }
//     })[0].i;

//     // using the iata_code as a key (maybe use index of airport in file instead > no need for keymap in application?)
//     const coordinates = {
//       x: parseFloat(postcodes[i].X.toFixed(coord_precision)),
//       y: parseFloat(postcodes[i].Y.toFixed(coord_precision)),
//       airport: airport,
//       plz: postcodes[i].plz,
//       name: postcodes[i].RS_gemname,
//       population: parseInt(postcodes[i].einwohner),
//       regiostar: parseInt(postcodes[i].RS_RegioStaRGem5),
//       mobility:mobilityTypes[postcodes[i].RS_RegioStaRGem5]
//     };

//     const coordinates_zip = await gzip(JSON.stringify(coordinates));

//     fs.writeFileSync(`./output/centroids/${postcodes[i].plz}.json`, coordinates_zip);
//   }
// })();

// calculate co2 values for all postcode centroids to 
// (async () => {
//   // for each postcode we calculate the distance to all major cities
//   for (let i = 0; i < postcodes.length; i += 1) {
//     const distances = {};
//     for (let li = 0; li < postcodes_large.length; li += 1) {

//       if (postcodes[i].plz !== postcodes_large[li].plz && postcodes[i].city !== postcodes_large[li].city) {

//         const route = await fetch('http://localhost:8002/route', {
//           headers: { 'Content-Type': 'application/json' },
//           method: 'POST', 
//           body: JSON.stringify({
//             locations:[
//               {lat: postcodes[i].Y, lon: postcodes[i].X, type: 'break'},
//               {lat: postcodes_large[li].Y, lon: postcodes_large[li].X, type: 'break'}
//             ],
//             costing: 'auto_co2',
//             directions_options: {
//               units: 'km',
//               directions_type: 'none'
//             }
//           })
//         }).then(res => res.json());

//         if ('trip' in route) {
//           distances[postcodes_large[li].city] = [Math.round(route.trip.summary.length), Math.round(route.trip.summary.time), parseFloat(postcodes_large[li].X.toFixed(coord_precision)), parseFloat(postcodes_large[li].Y.toFixed(coord_precision))];
//         }
//       }
//     }
//     fs.writeFileSync(`./output/distances/${postcodes[i].plz}.json`, JSON.stringify(distances), 'utf8');
//     console.log(i,postcodes.length);
//   }
// })();

// generate isochrones for each postcode

// 2020 > Deutscher Durchschnitt: 11t > 23% Mobilität > 2,53t > 52 Wochen á 5 Tage = 260 Tage > pro Tag 9,7 kg
// 2050 > Ziel 1t - 2.7t > 23% Mobilität > s.o > pro Tag 0,9 - 2,4 kg

// TODO: calculate max distance within isochrone (loop through polygon points and calculate distance to centroid)

// TODO: Fahrzeuge effizienter in der Zukunft (https://www.bmu.de/fileadmin/Daten_BMU/Pools/Broschueren/elektroautos_bf.pdf) 
// Benziner 10% besser
// Eauto 50% besser
// ÖPNV ??? 30%?

// ÖPNV 39% von PKW

// value after comments without more efficiency

const co2_today = 11; // t
const co2_model_low = 1; // t
const co2_model_high = 2.7; // t
const mobility_share = 23; // %
const days_per_week = 5;

const co2_perday_today = co2_today            / 100 * mobility_share / (52 * days_per_week) * 1000 * 1000; // gr
const co2_perday_model_low = co2_model_low    / 100 * mobility_share / (52 * days_per_week) * 1000 * 1000; // gr
const co2_perday_model_high = co2_model_high / 100 * mobility_share / (52 * days_per_week) * 1000 * 1000; // gr

const performance_2050_car = 10; // %
const performance_2050_ecar = 50; // %
const performance_2050_public = 30; // %

const multiplier_carmf = 2;
const multiplier_ecar = 2;
const multiplier_public = 2.63;

const iso_definitions = {
  'car_2020': co2_perday_today, // 9700
  'car_2050_min':      co2_perday_model_low  * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)), // 990
  'car_2050_max':      co2_perday_model_high * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)), // 2640
  'car_2050_bike_min': co2_perday_model_low  * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5 / 3, // 1650
  'car_2050_bike_max': co2_perday_model_high * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5 / 3, // 4400 

  'car_mf_2020': co2_perday_today * multiplier_carmf, // 19400
  'car_mf_2050_min':      co2_perday_model_low  * multiplier_carmf * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)), // 1980
  'car_mf_2050_max':      co2_perday_model_high * multiplier_carmf * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)), // 5280
  'car_mf_2050_bike_min': co2_perday_model_low *  multiplier_carmf * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5 / 3, // 3300
  'car_mf_2050_bike_max': co2_perday_model_high * multiplier_carmf * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5 / 3, // 8800

  'ecar_2020': co2_perday_today * multiplier_ecar, // 19400
  'ecar_2050_min':      co2_perday_model_low  * multiplier_ecar * (1 + (1 / (100 - performance_2050_ecar) * performance_2050_ecar)), // 3600
  'ecar_2050_max':      co2_perday_model_high * multiplier_ecar * (1 + (1 / (100 - performance_2050_ecar) * performance_2050_ecar)), // 9600
  'ecar_2050_bike_min': co2_perday_model_low  * multiplier_ecar * (1 + (1 / (100 - performance_2050_ecar) * performance_2050_ecar)) * 5 / 3, // 6000
  'ecar_2050_bike_max': co2_perday_model_high * multiplier_ecar * (1 + (1 / (100 - performance_2050_ecar) * performance_2050_ecar)) * 5 / 3, // 16000

  'public_2020': co2_perday_today * multiplier_public, // 37830
  'public_2050_min':      co2_perday_model_low  * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)), // 5019
  'public_2050_max':      co2_perday_model_high * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)), // 13384
  'public_2050_bike_min': co2_perday_model_low  * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)) * 5 / 3, // 8365
  'public_2050_bike_max': co2_perday_model_high * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)) * 5 / 3, // 22308

  'bike_2050_car_min':    co2_perday_model_low  * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5, // 4950
  'bike_2050_car_max':    co2_perday_model_high * (1 + (1 / (100 - performance_2050_car) * performance_2050_car)) * 5, // 13200
  'bike_2050_public_min': co2_perday_model_low  * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)) * 5, // 23666
  'bike_2050_public_max': co2_perday_model_high * multiplier_public * (1 + (1 / (100 - performance_2050_public) * performance_2050_public)) * 5 // 66924
};

const sets = {
  'car': ['car_2020', 'car_2050_min', 'car_2050_max', 'public_2050_min', 'public_2050_max', 'car_2050_bike_min', 'car_2050_bike_max'],
  'car_mf': ['car_mf_2020', 'car_mf_2050_min', 'car_mf_2050_max', 'public_2050_min', 'public_2050_max', 'car_mf_2050_bike_min', 'car_mf_2050_bike_max'],
  'ecar': ['ecar_2020', 'ecar_2050_min', 'ecar_2050_max', 'public_2050_min', 'public_2050_max', 'ecar_2050_bike_min', 'ecar_2050_bike_max'],
  'public': ['public_2020', 'public_2050_min', 'public_2050_max', 'car_2050_min', 'car_2050_max', 'public_2050_bike_min', 'public_2050_bike_max'],
  'bike': ['car_2020', 'car_2050_min', 'car_2050_max', 'bike_2050_car_min', 'bike_2050_car_max', 'bike_2050_public_min', 'bike_2050_public_max']
};

(async () => {
  // for each postcode we calculate the distance to all major cities
  for (let i = 0; i < postcodes.length; i += 1) {
    for (let set_key in sets) {
      let isochrones = {
        "type": "FeatureCollection",
        "features": []
      };
      for (let key in sets[set_key]) {

        const route = await fetch('http://localhost:8002/isochrone', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST', 
          body: JSON.stringify({
            locations:[
              {lat: postcodes[i].Y, lon: postcodes[i].X}
            ],
            polygons: true,
            denoise: 1,
            generalize: 1,
            costing: 'auto_co2',
            // divided by 2 to include return trip...
            contours: [{ time: iso_definitions[sets[set_key][key]]/60/2 }]
          })
        }).then(res => res.json());

        isochrones.features.push(route.features[0]);
      }

      isochrones.features.forEach((feature, fi) => {
        feature.geometry.coordinates.forEach((coords, cis) => {
          isochrones.features[fi].geometry.coordinates[cis].forEach((coord, ci) => {
            coord.forEach((num, ni) => {
              isochrones.features[fi].geometry.coordinates[cis][ci][ni] = parseFloat(num.toFixed(3));
            });
          });
        });
      });

      const options = {tolerance: 0.005, highQuality: true};
      isochrones = simplify(isochrones, options);

      const isochrone_export = {};

      isochrones.features.forEach((feature, fi) => {
        if (isochrones.features[fi].geometry.coordinates.length > 1) {
          console.log('SHIT');
        }
        feature.geometry.coordinates.forEach((coords, cis) => {
          isochrones.features[fi].geometry.coordinates[cis] = smooth(coords);
          isochrones.features[fi].geometry.coordinates[cis].forEach((coord, ci) => {
            coord.forEach((num, ni) => {
              isochrones.features[fi].geometry.coordinates[cis][ci][ni] = parseFloat(num.toFixed(3));
            });
          });
        });
        isochrone_export[sets[set_key][fi]] = feature.geometry.coordinates[0].map((coordinate) => `${coordinate[0]},${coordinate[1]}`).join(';');
      });

      const isochrones_zip = await gzip(JSON.stringify(isochrone_export));
      // fs.writeFileSync(`./output/isochrones/${postcodes[i].plz}_${set_key}.json`, isochrones_zip);
      fs.writeFileSync(`./output/isochrones/${postcodes[i].plz}_${set_key}.json`, JSON.stringify(isochrones), 'utf8');
      process.exit();
    }
    console.log(postcodes.length, i);
  }
})();
