const fs = require('fs');
const turf = require('@turf/turf');

["bike", "car_mf", "car", "ecar", "public"].forEach((type) => {

  const json = JSON.parse(fs.readFileSync('./41372_' + type + '.json', 'utf8'));


  Object.keys(json).forEach((key) => {

    let duplicates = 0;

    let path = json[key].split(';').map((c) => c.split(',').map((cc) => parseFloat(cc)));
    
    // const tPath = [];
    // path.forEach((c, ci) => {
    //   if (
    //     ci === 0 || 
    //     c[0] !== path[ci - 1][0] || 
    //     c[1] !== path[ci - 1][1]
    //   ) {
    //     tPath.push(c);
    //   }
    // });
    // path = tPath;
    
    path.forEach((c, ci) => {
      if (ci > 0 && path[ci-1][0] === c[0] && path[ci-1][1] === c[1]) {
        duplicates += 1;
      }
    });

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type:"Polygon",
        coordinates: [path]
      }
    };

    console.log(type, key, duplicates, path.length, turf.bbox(geojson));

  });

});