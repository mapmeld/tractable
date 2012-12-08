# Tractable

Resize and recolor floating Census tracts.  Based on the D3 example, <a href="http://mbostock.github.com/d3/talk/20111018/force-states.html">force-directed states</a>.

This example uses parts of Boston and Cambridge, Massachusetts.  Cambridge is shaded in purple.

<img src="http://i.imgur.com/baILk.png"/>

## On scaling and coloring

If you choose non-geographic scaling (such as population), each tract gets different scaling. Two tracts with the same population, regardless of shape, will be given the same area.

Color scales are currently from #000000 (black) to #00ff00 (bright green).

## Technology used

Client-side: D3.js

Server-side: Github Pages (static site)

Data-creation: Saved GeoJSON files from QGIS

## ToDo

* Make better use of floating tracts

* Add in more Census datasets (for example, ACS on education and income)

* Add a static map image as a background to tracts