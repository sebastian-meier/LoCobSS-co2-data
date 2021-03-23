const fs = require('fs');
const { ungzip } = require('node-gzip');
const turf = require('@turf/turf');

const states = JSON.parse(fs.readFileSync('./data/states.geo.json', 'utf8'));

let csv = 'postcode,regiostar,state';

fs.readdir('./output/centroids/', async (err, files) => {
  for (let i = 0; i < files.length; i += 1){
    
    const centroid = await ungzip(fs.readFileSync('./output/centroids/' + files[i]));
    const {x, y, regiostar} = JSON.parse(centroid.toString());

    let state = null;

    states.features.forEach((f) => {
      if (turf.booleanPointInPolygon(
        turf.point([x, y]),
        f
      )) {
        state = f.properties.id.split('-')[1];
      }
    });

    csv += `\n${files[i].split('.')[0]},${(regiostar) ? regiostar-50 : 0},${state}`;
  }

  await fs.writeFileSync('./output/platform.csv', csv, 'utf8');
});

