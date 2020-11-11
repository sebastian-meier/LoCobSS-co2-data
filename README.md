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



# Upload to S3

Set   Content-Type = Actual mime type
Set   Content-Encoding = gzip