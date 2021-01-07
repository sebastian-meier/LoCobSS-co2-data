## Intro

We were in search of a tool that would base its routing decisions and output not on speed/time, but instead on speed/co2. We were particularly interested in generating isochrones for a given co2-budget. We had to apply some changes to the valhalla source code, because in several places values (e.g. default speeds) are hard coded into the source (more about this later). But we primarily achieved this by modifing the osm.pbf file that is used to generate the routing tiles.

## Modifying the OSM data

This is just a very short overview. A detailed description of how we did it and some helper scripts are available [here](https://github.com/sebastian-meier/valhalla-co2).
- Download OSM-Extract (osm.pbf)
- Convert to text file using osmium (opl)
- Extract all maxspeeds using osmium-tool tags-count
- Use data from the German Environmental Agency to transform speeds to co2
- Replace the maxspeed values in the opl-textfile
- Convert back to osm.pbf 
- Use valhalla to build routing tiles and start the service

## Using the new service

You can now use the service as before. For example, you can request a route from A to B, but instead of actual time, the parameter time refers to the generated co2 on that route. Because the system tries to reduce time/co2 it will favor routes at optimal co2-speeds (not too slow, not too fast). Based on this, you can also create isochrones, which will return the area that you can cover on a given co2-budget.

*IMPORTANT*: Because speeds are provided in km/h and time is being calculated in minutes, and instead of a distance/time value, we have a distance/co2 unit, we had to trick the system a bit. Due to the internal calculations, the values provided for the isochrones need to be:
```javascript
// isochrones
const input = value_in_co2_gram / 60;
```
The return values for routing are in co2-gramms. 

## Problems

The underlying conceptual model uses the maxspeed of every road to calculate the co2 costs for traveling along this road. BUT, obviously while you can drive 250 km/h on some highways in Germany, no one is forcing you to do so. We tried to account for this by reducing the maximum speed allowed slightly, but still, this is a bit of a problem. So the routing engine often uses German country roads, because they are very close to the optimal speed.

## Next steps

Besides the problem above, right now our version only looks at co2, but it would be really interesting to find an optimum between time and co2.

## Thoughts about valhalla

While modifying the engine, we thought, that all those hard coded speed variables are not ideal. Probably not only for weird projects like ours, but more use cases. We believe it would be great for the project to somehow collect all those hard coded variables into a central config file. Particularly everything around maxspeed. 