# Train trips

Trying to calculate a co2 footprint of trainrides by km for long-distance calculations.

## Berlin to
City, km, Co2-kg, Time, Type
München, 508, 0.08, 4:37, Only ICE
Frankfurt am Main, 423, 0.06, 4:32, Only ICE
Düsseldorf, 477, 0.07, 4:23, Only ICE
Hamburg, 256, 0.03, 1:55, Only ICE
Münster, 398, 1.7, 3:36, ICE + RE


https://www.bahn.de/wmedia/view/mdb/media/intern/umc-grundlagenbericht.pdf
Fernverkehr > ökostrom: 0.003
0,519 kg CO2 pro kWh

IC/EC/ICE 26 - 37 > 30 pro Wh

Nach München:

508 * 30 > 15240 Wh / 1000 > 15,24 kWh

Öko: 15,24 * 0.003 > 0,0457
Durchschnitt: 15.24 * 0.519 > 7,9

508 * 37 > 18796 Wh / 1000 > 18,796 kWh

Öko: 18,796 * 0.003 > 0,0564
Durchschnitt: 18,796 * 0.519 > 9,7551

Not straight line: +40%

AVERAGE_SPEED_ENERGY = 30
NOT_STRAIGHT_LINE = 1.35
AVERAGE_CO2 = (0.003 + 0.519) / 2 OR 0.519

DISTANCE * NOT_STRAIGHT_LINE * AVERAGE_SPEED_ENERGY / 1000 * AVERAGE_CO2 > Result

