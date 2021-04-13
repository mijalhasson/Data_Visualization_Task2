import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { statsPrevious, statsActual, ResultEntry } from "./stats";


// set the affected color scale
const color = d3
  .scaleThreshold<number, string>()
  .domain([0, 1, 100, 500, 700, 5000])
  .range([
    "#FFFFF",
    "#FFE8E5",
    "#F88F70",
    "#CD6A4E",
    "#A4472D",
    "#7B240E",
    "#540000",
  ]);


  const assignCountryBackgroundColor = (comunidad: string,
                                        stats: ResultEntry[]) => {
    const item = stats.find(
      (item) => item.name === comunidad
    );
    return item ? color(item.value) : color(0);
  };
  

const maxAffected = (stats: ResultEntry[]) => {
  return stats.reduce(
  (max, item) => (item.value > max ? item.value : max), 0)
};

const calculateRadiusBasedOnAffectedCases = (
  comunidad: string,
  stats: ResultEntry[]
) => {
  var max = <number>maxAffected(stats);
  const entry = stats.find((item) => item.name === comunidad);
  
  return entry ? (entry.value/max)*40 : 0;
}

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain() // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

function myFunction(d:any,stats: ResultEntry[] ) {
  return assignCountryBackgroundColor(d.properties.NAME_1, stats);
}
svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);

  /*
  // data loaded from json file
  .attr("d", geoPath as any)
  .style("fill", function (d: any) {
    //const entry = stats.find((item) => item.name === d);
    return assignCountryBackgroundColor(d.properties.NAME_1, statsActual);
  });
  */
 

// Buttons and changing data series
document
  .getElementById("Previous")
  .addEventListener("click", function handleResults() {
    updateChart(statsPrevious);
  });

document
  .getElementById("Actual")
  .addEventListener("click", function handleResults() {
    updateChart(statsActual);
  });

const updateChart = (stat: ResultEntry[]) => {
  console.log("updating")
  svg.selectAll("path").remove();
  svg.selectAll("circle").remove();
  svg.selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any)
  .style("fill", function (d: any) {
    return assignCountryBackgroundColor(d.properties.NAME_1, stat);
  });
  return svg
    .selectAll("circle")
    .data(latLongCommunities)
    .enter()
    .append("circle")
    .attr("class", "affected-marker")
    .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, stat))
    .attr("cx", (d) => aProjection([d.long, d.lat])[0])
    .attr("cy", (d) => aProjection([d.long, d.lat])[1]);
};



/*
COLORES
#91077D
#CB236E


#########################
.country {
  stroke-width: 1;
  stroke: #39245a;
  fill: #704ea7;
}


.affected-marker {
  stroke-width: 1;
  stroke: #291b3d;
  fill: #C197FF;
  fill-opacity: 0.7;
}

########################
.country {
  stroke-width: 1;
  stroke: #4f0828;
  fill: #841f4c;
}


.affected-marker {
  stroke-width: 1;
  stroke: #7b3625;
  fill: #D4674D;
  fill-opacity: 0.7;
}

*/

 /*
const maxAffected2 = (dataset: ResultEntry[]) => {
  var max = dataset[0];
  for(var i = 0; i < dataset.length; i++){
    var item = dataset[i];
    if(item.value>max.value){
      max = item;
    }
}
return max.value;
};
*/

/*
Data taken from 
https://www.eldiario.es/sociedad/mapa-datos-coronavirus-espana-comunidades-autonomas-abril-9_1_1039633.html
"casos notificados en el dia"
12/04/2021
*/