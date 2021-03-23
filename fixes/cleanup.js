const fs = require('fs');
const { gzip, ungzip } = require('node-gzip');
const smooth = require('chaikin-smooth');
const {cleanCoords, unkinkPolygon, kinks, simplify} = require('@turf/turf');

const old_folder = 'output/isochrones';
const new_folder = 'output/clean-isochrones';

const files = fs.readdirSync(old_folder);

const errors = [];

const problemIDs = [2056, 2907, 3986, 5842, 
                  6520, 6521, 6524, 7696,10893, 
                  18520,18521,18524,26241,31592, 
                  32310,32311,32314,33201,34230,
                  34231,34234];

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

const clean = async() => {

  for (let f = 0; f < files.length; f += 1) {
    const file = files[f];

    const zip = fs.readFileSync(old_folder + '/' + file);
    const unzip = await ungzip(zip);
    const json = JSON.parse(unzip);

    Object.keys(json).forEach((key) => {
      let coords = json[key].split(';').map((c) => c.split(',').map((cc) => parseFloat(cc)));

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

      let geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };

      if (problemIDs.includes(f)) {
        const id = problemIDs.indexOf(f);
        if (problems[id][1] === key) {
          geojson.geometry.coordinates[0] = smooth(geojson.geometry.coordinates[0])
          const options = {tolerance: 0.0008, highQuality: true};
          geojson = simplify(geojson, options);
        }
      }

      let cleanedCoords = geojson;

      try {
        cleanedCoords = cleanCoords(geojson);
        if (kinks(cleanedCoords).features.length > 0) {
          cleanedCoords = unkinkPolygon(cleanedCoords).features[0];  
        }
      } catch (error) {
        try {
          geojson.geometry.coordinates[0] = smooth(geojson.geometry.coordinates[0])
          const options = {tolerance: 0.0008, highQuality: true};
          cleanedCoords = simplify(geojson, options);
          cleanedCoords = cleanCoords(cleanedCoords);
          if (kinks(cleanedCoords).features.length > 0) {
            cleanedCoords = unkinkPolygon(cleanedCoords).features[0];  
          }
        } catch (error) {
          console.log(error);
          errors.push([
            file, key
          ]);
          console.log('ERROR', file, key, errors.length);
          process.exit();
        }
      }

      json[key] = cleanedCoords.geometry.coordinates[0].map((c) => c.map((n) => n.toFixed(4)).join(',')).join(';');
    });

    const newZip = await gzip(JSON.stringify(json));
    fs.writeFileSync(new_folder + '/' + file, newZip);
    console.log(f, files.length);
  }
  fs.writeFileSync('clean-errors.json', JSON.stringify(errors));
  console.log(JSON.stringify(errors));
};

clean();