const fs = require('fs');
const smooth = require('chaikin-smooth');
const {ungzip} = require('node-gzip');
const {area, simplify, cleanCoords, kinks, unkinkPolygon} = require('@turf/turf');
const d3 = require('d3');
const errors = JSON.parse(fs.readFileSync('clean-errors.json', 'utf8'));

const makeGeoJson = (d) => {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [d]
    }
  };
};

// (async () => {
//   for (let e = 0; e < errors.length; e += 1){
//     const zip = await ungzip(fs.readFileSync('./output/isochrones/' + errors[e][0]));
//     const data = JSON.parse(zip);
//     const jData = data[errors[e][1]].split(';').map((c) => c.split(',').map((cc) => parseFloat(cc)));

//     let coords = jData;

//     // remove direct sequences of duplicate coords
//     let tCoords = [];
//     coords.forEach((c, ci) => {
//       if (ci === 0 || c[0] !== coords[ci - 1][0] || c[1] !== coords[ci - 1][1]) {
//         tCoords.push(c);
//       }
//     });
//     coords = tCoords;

//     // remove duplicate coordinates in general (besides start and end) > this is turf bug?!
//     tCoords = [];
//     coords.forEach((c, ci) => {
//       let exists = false;

//       for (let i = ci - 1; i >= 0; i -= 1) {
//         if (c[0] === coords[i][0] && c[1] === coords[i][1]) {
//           exists = true;
//         }
//       }

//       if (ci === 0 || ci === coords.length - 1 || !exists ) {
//         tCoords.push(c);
//       }
//     });
//     coords = tCoords;

//     let geojson = makeGeoJson(coords);

//     geojson.geometry.coordinates[0] = smooth(geojson.geometry.coordinates[0])
//     const options = {tolerance: 0.0008, highQuality: true};
//     geojson = simplify(geojson, options);
  
//     let cleanedCoords = cleanCoords(geojson);

//     if (kinks(cleanedCoords).features.length > 0) {
//       try {
//         cleanedCoords = unkinkPolygon(cleanedCoords).features[0];
//       } catch (error) {
//         console.log('ERROR');
//         console.log(JSON.stringify(cleanedCoords))
//       }
//     }
//   }
// })();

const files = fs.readdirSync('./output/isochrones');
const problems = [
  [2056, 'car_2050_bike_min'],
  [2907, 'car_mf_2050_min'],
  [3986, 'car_2050_bike_min'],
  [5842, 'car_mf_2050_min'],
  [6520, 'car_2050_min'],
  [6521, 'car_2050_min'],
  [6524, 'car_2050_min'],
  [7696, 'car_2050_bike_min'],
  [10893, 'ecar_2050_min'],
  [18520, 'car_2050_min'],
  [18521, 'car_2050_min'],
  [18524, 'car_2050_min'],
  [26241, 'car_2050_bike_min'],
  [31592, 'car_mf_2050_min'],
  [32310, 'car_2050_min'],
  [32311, 'car_2050_min'],
  [32314, 'car_2050_min'],
  [33201, 'car_2050_bike_min'],
  [34230, 'car_2050_min'],
  [34231, 'car_2050_min'],
  [34234, 'car_2050_min']
];

(async () => {
  for (let p = 0; p < problems.length; p += 1){
    const zip = await ungzip(fs.readFileSync('./output/isochrones/' + files[problems[p][0]]));
    const data = JSON.parse(zip);
    const keys = Object.keys(data);
    // for (let k = 0; k < keys.length; k += 1) {
      const jData = data[problems[p][1]].split(';').map((c) => c.split(',').map((cc) => parseFloat(cc)));

      let coords = jData;

      // remove direct sequences of duplicate coords
      let tCoords = [];
      coords.forEach((c, ci) => {
        if (ci === 0 || c[0] !== coords[ci - 1][0] || c[1] !== coords[ci - 1][1]) {
          tCoords.push(c);
        }
      });
      coords = tCoords;

      // remove duplicate coordinates in general (besides start and end) > this is turf bug?!
      tCoords = [];
      coords.forEach((c, ci) => {
        let exists = false;

        for (let i = ci - 1; i >= 0; i -= 1) {
          if (c[0] === coords[i][0] && c[1] === coords[i][1]) {
            exists = true;
          }
        }

        if (ci === 0 || ci === coords.length - 1 || !exists ) {
          tCoords.push(c);
        }
      });
      coords = tCoords;

      let geojson = makeGeoJson(coords);

      geojson.geometry.coordinates[0] = smooth(geojson.geometry.coordinates[0])
      const options = {tolerance: 0.0008, highQuality: true};
      geojson = simplify(geojson, options);
      // console.log(files[problems[p]], problems[p], keys[k]);
    
      let cleanedCoords = cleanCoords(geojson);

      if (kinks(cleanedCoords).features.length > 0) {
        try {
          cleanedCoords = unkinkPolygon(cleanedCoords).features[0];
        } catch (error) {
          console.log('ERROR');
          console.log(JSON.stringify(cleanedCoords))
        }
      }

      console.log(JSON.stringify(cleanedCoords))
      process.exit();

      console.log(p);
    // }
  }
})();
