# LoCobSS-co2-data
Part of the LoCobSS project. Tool to generate the data required for the CO2 storytelling use case.

# Install

```
npm install
```

# Isochrones

## Postcode-Validation

The content of the data folder is extracted from OpenStreetMap Data (ODbL). Thanks to https://www.suche-postleitzahl.org there is a simple way to download the data. The data was enriched with inhabitant data from the 2011 census.

```
cd isochrones
node postcode-validation.js
```

In order for the UI to be able to validate the user's input, we need a list of valid German postcodes. This file outputs a one-line comma-separated string of postcodes. The resulting file is gzipped as a preparation for AWS S3 storage.

In order to quickly zoom onto the postcode before loading the isochrones, the coordinates are stored in a tiny text file. In addition this file also holds the information what the closest airport is.
x,y,airportcode

# Airports

curl http://localhost:8002/route --data '{"locations":[{"lat":52.42428441929931,"lon":13.37224784993865,"type":"break"},{"type":"break","lat":52.41429936656083,"lon":13.363986646180326}],"costing":"auto_co2","directions_options":{"units":"km", "directions_type":"none"}}' | jq '.'

curl http://localhost:8002/isochrone --data '{"locations":[{"lat":52.42428441929931,"lon":13.37224784993865}],"costing":"auto_co2","contours":[{"time":164,"color":"ff0000"}]}' | jq '.'


# Upload to S3

Set   Content-Type = Actual mime type
Set   Content-Encoding = gzip

RegiostarGem5
51	Metropole
52	Regiopole, Großstadt
53	Zentrale Stadt, Mittelstadt
54	Städtischer Raum
55	Kleinstädtischer, dörflicher Raum
