This repo is part of the LoCobSS research project. More details about the project and dependencies to other repos can be found [here](https://github.com/sebastian-meier/LoCobSS-documentation).

# LoCobSS-co2-data
Part of the LoCobSS project. Tool to generate the data required for the CO2 [storytelling use case](https://github.com/sebastian-meier/locobss-story-climate-risk-zones).

## Install

```
npm install
```

## Preparations

You need to have an instance of [Valhalla](https://github.com/valhalla/valhalla) running on your machine (http://localhost:8002). We have used a customized version, that uses CO2 instead of time for routing calculations, see [here](https://github.com/sebastian-meier/valhalla/).

## Creating the data

```
node index.js
```

## Uploading the data to S3

```
node upload.js
```

## Testing the data
If you want to quickly see the isochrones build by the tool run:

```
node iso2geojson.js NAME_OF_GZIP_POSTCODE_FILE.json
```
This will generate a GeoJSON for viewing.

## Fixing broken geometries
We had some problems with some geometries and had to apply custom fixes. You can find some exemplary code for that in the **./fixes/** folder.

## Sources

- https://mobilitaet-in-tabellen.dlr.de/mit/login.html?brd
- https://www.bmu.de/fileadmin/Daten_BMU/Pools/Broschueren/elektroautos_bf.pdf
- https://www.umweltmobilcheck.de/
- https://www.bahn.de/wmedia/view/mdb/media/intern/umc-grundlagenbericht.pdf
- https://www.umweltbundesamt.de/bild/vergleich-der-durchschnittlichen-emissionen-0
- https://raw.githubusercontent.com/datasets/airport-codes/master/data/airport-codes.csv
