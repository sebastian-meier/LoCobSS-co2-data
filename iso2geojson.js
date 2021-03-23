const fs = require('fs');
const {ungzip} = require('node-gzip');

(async () => {
  const zip = await ungzip(fs.readFileSync('./output/isochrones/' + process.argv[2]));

  const json = JSON.parse(zip);

  const geojson = {
    type: "FeatureCollection",
    features: []
  };

  Object.keys(json).forEach((key) => {
    geojson.features.push({
      type: "Feature",
      properties: {
        stroke: "#555555",
        "stroke-width": 2,
        "stroke-opacity": 1,
        fill: "#00aa22",
        "fill-opacity": 0.2
      },
      geometry: {
        type: "Polygon",
        coordinates: [json[key].split(';').map((set) => set.split(',').map((coord) => parseFloat(coord)))]
      }
    });
  });

  fs.writeFileSync('output/iso-temp.geojson', JSON.stringify(geojson), 'utf8')
})();