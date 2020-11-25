# General Comment
All of the files are gzipped compressed. If the browser downloads them for using in a script this is automatically unzipped and you don't need to worry. But if you download it directly, you might need to unzip them first.

# postcodes.txt

## Size
21.7 kb

## Purpose
Validating postcode input by user

## Structure
Comma separated list of postcodes

## Comment
This is the second biggest file and its only used for validation. Not sure if there is a better way?

# airports.csv

## Size
14.1 kb

## Purpose
Allow users to select a flight between two airports. Distance calculated with @turf/distance

## Structure
Airport Code, Name, Latitude, Longitude

## Comment
This only contains big commercial airports

# centroids/[POSTCODE].json

## Size
roughly 0.25 kb

## Purpose
- Centering the map on the postcode while the isochrones load and for centering the distance circle.
- Generating the distance matrix for user selection
- Closest airport (number refers to the id/position in the airport file), therefore, no keymap needs to be created on clientside
- The cityname can be used if we want to highlight distances to other cities

## Structure
x: Longitude
y: Latitude
airport: id in airport table
plz
name: of city
population
regiostar (see below)
mobility (the types and distances people travel in %, 0 to 5km, 5 to 20, 20 to 50 and more than 50km)

## Comment
Regiostar refers to the following categorization:

51	Metropole
52	Regiopole, Großstadt
53	Zentrale Stadt, Mittelstadt
54	Städtischer Raum
55	Kleinstädtischer, dörflicher Raum

# isochrones/[POSTCODE]_[TRAVELTYPE].json

TRAVELTYPE:
- bike
- car_mf
- car
- ecar
- public

## Size
between 25 kb and 75 kb

## Purpose
Visualising the isochrones according to the storyline

## Structure
It's one big geojson-FeatureCollection. The order and content is as follows (see Figma):

```
const sets = {
  'car': ['car_2020', 'car_2050_min', 'car_2050_max', 'public_2050_min', 'public_2050_max', 'car_2050_bike_min', 'car_2050_bike_max'],
  'car_mf': ['car_mf_2020', 'car_mf_2050_min', 'car_mf_2050_max', 'public_2050_min', 'public_2050_max', 'car_mf_2050_bike_min', 'car_mf_2050_bike_max'],
  'ecar': ['ecar_2020', 'ecar_2050_min', 'ecar_2050_max', 'public_2050_min', 'public_2050_max', 'ecar_2050_bike_min', 'ecar_2050_bike_max'],
  'public': ['public_2020', 'public_2050_min', 'public_2050_max', 'car_2050_min', 'car_2050_max', 'public_2050_bike_min', 'public_2050_bike_max'],
  'bike': ['car_2020', 'car_2050_min', 'car_2050_max', 'bike_2050_car_min', 'bike_2050_car_max', 'bike_2050_public_min', 'bike_2050_public_max']
};
```

# distances/[POSTCODE].json

## Size
0.723 kb

## Purpose
For the flights calculating routes in Germany that produce n times the amount of CO2.

## Structure
A json, for each city it includes and array of:
[distance, co2, x-, y-coordinates]

## Comment
Right now it includes cities with more than 300.000 inhabitants.
After building these, I know had the though that it might actually be more fun, to calculate car and train trips to european vacation destinations, like Paris, Rome, Barcelona, etc. For those european trips i would probably only use airline distance and not correctly routed distance, as the flight-trips are also only airline distance.