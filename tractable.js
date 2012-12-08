
var w = 1280,
    h = 800;

var projection = d3.geo.albersUsa()
    .scale(220000)
    .translate([-74400, 27800]);

var path = d3.geo.path().projection(projection),
    force = d3.layout.force().size([w, h]);

var svg = d3.select("#d3space").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.json("BostonTracts.geojson", function(tracts) {
  var nodes = [],
      links = [];

  tracts.features.forEach(function(d, i) {
    var centroid = path.centroid(d);
    centroid.x = centroid[0];
    centroid.y = centroid[1];
    centroid.feature = d;
    nodes.push(centroid);
  });

  d3.geom.delaunay(nodes).forEach(function(d) {
    links.push(edge(d[0], d[1]));
    links.push(edge(d[1], d[2]));
    links.push(edge(d[2], d[0]));
  });
  
  force
      .gravity(0)
      .nodes(nodes)
      .links(links)
      .linkDistance(function(d) { return d.distance; })
      .start();

  var link = svg.selectAll("line")
      .data(links)
    .enter().append("svg:line")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  var node = svg.selectAll("g")
      .data(nodes)
    .enter().append("svg:g")
      .attr("transform", function(d) { return "translate(" + -d.x + "," + -d.y + ")"; })
      .attr("geoid", function(d){ return d.feature.properties.GEOID })
      .call(force.drag)
    .append("svg:path")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("geoid", function(d){ return d.feature.properties.GEOID })
      .attr("d", function(d) { return path(d.feature); }).classed("cambridge", function(d){
        if(d.feature.properties.COUNTYFP == "017" || d.feature.properties.COUNTYFP == "017"){
          // north of the Charles River
          return true;
        }
        else{
          return false;
        }
      });

  force.on("tick", function(e) {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
  
  $("#sizeby").change(function(e){
    var sizeby = $("#sizeby").val();
    if(sizeby == "area"){
      // scale to actual area
      nodes.forEach(function(d, i){
        var newscale = 1;
        var currenttranslate = d3.transform( d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform") ).translate;
        var currentscale = d3.transform( d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform") ).scale;
        console.log(d);
        var tx = (currenttranslate[0] - d.dx) * newscale / currentscale[0] + d.dx;
        var ty = (currenttranslate[1] - d.dy) * newscale / currentscale[1] + d.dy;
        d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform", "translate(" + tx + ", " + ty + ") scale(" + newscale + ")");
      });
    }
    else if(sizeby == "population"){
      var popmax = 0;
      var area_popmax = 0;
      nodes.forEach(function(d, i){
        if(d.feature.properties.POPULATION > popmax){
          popmax = d.feature.properties.POPULATION;
          area_popmax = d.feature.properties.ALAND + d.feature.properties.AWATER;
        }
      });
      nodes.forEach(function(d, i){
        var share = Math.max(d.feature.properties.POPULATION / popmax, 0.01);
        var scalearea = share * area_popmax * 1.8;
        var newscale = Math.sqrt( scalearea / ( d.feature.properties.ALAND + d.feature.properties.AWATER ) );
        var currenttranslate = d3.transform( d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform") ).translate;
        var currentscale = d3.transform( d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform") ).scale;
        var tx = (currenttranslate[0] - d.x) * newscale / currentscale[0] + d.x;
        var ty = (currenttranslate[1] - d.y) * newscale / currentscale[1] + d.y;
        d3.select(svg.selectAll("g[geoid='" + d.feature.properties.GEOID + "']")[0][0]).attr("transform", "translate(" + tx + ", " + ty + ") scale(" + newscale + ")");
      });
    }
  });

  $("#colorby").change(function(e){
    var sizeby = $("#colorby").val();
    if(sizeby == "county"){
      nodes.forEach(function(node, i){
        d3.selectAll("path[geoid='" + node.feature.properties.GEOID + "']")[0].forEach(function(path,i){
          if(node.feature.properties.COUNTYFP == "017"){
            path.style.fill = "#aaf";
          }
          else{
            path.style.fill = "#aaa";
          }
        });
      });
    }
    else if(sizeby == "area"){
      var areamax = 0;
      nodes.forEach(function(node, i){
        areamax = Math.max(areamax, node.feature.properties.ALAND + node.feature.properties.AWATER);
      });
      nodes.forEach(function(node, i){
        d3.selectAll("path[geoid='" + node.feature.properties.GEOID + "']")[0].forEach(function(path,i){
          var greenScale = Math.floor(256 * (node.feature.properties.ALAND + node.feature.properties.AWATER) / areamax);
          if(greenScale < 16){
            greenScale = "0" + greenScale.toString(16);
          }
          else{
            greenScale = greenScale.toString(16);
          }
          path.style.fill = "#00" + greenScale + "00";
        });
      });
    }
    else if(sizeby == "population"){
      var popmax = 0;
      nodes.forEach(function(node, i){
        popmax = Math.max(popmax, node.feature.properties.POPULATION);
      });
      nodes.forEach(function(node, i){
        d3.selectAll("path[geoid='" + node.feature.properties.GEOID + "']")[0].forEach(function(path,i){
          var greenScale = Math.floor(256 * node.feature.properties.POPULATION / popmax);
          if(greenScale < 16){
            greenScale = "0" + greenScale.toString(16);
          }
          else{
            greenScale = greenScale.toString(16);
          }
          path.style.fill = "#00" + greenScale + "00";
        });
      });
    }
  });

  
});

function edge(a, b) {
  var dx = a[0] - b[0], dy = a[1] - b[1];
  return {
    source: a,
    target: b,
    distance:  Math.pow(dx * dx + dy * dy, 0.53)
  };
}
