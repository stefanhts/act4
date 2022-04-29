var map = d3.select('#map');
var mapWidth = +map.attr('width');
var mapHeight = +map.attr('height');

var activeMapType = 'nodes_links';

var atlLatLng = new L.LatLng(20.7771, -75.3900);
var myMap = L.map('map').setView(atlLatLng, 4.5);

var vertices = d3.map();
var nodeFeatures = [];

var filterYear = 2016
var elem = document.getElementById('year_dropdown');
elem.addEventListener("change", onSelectChange);

var choroScale = d3.scaleThreshold()
	.domain([10,20,50,100,200,500,1000])
	.range(d3.schemeYlOrRd[8]);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
    maxZoom: 10,
    minZoom: 3,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
}).addTo(myMap);

var svgLayer = L.svg();
svgLayer.addTo(myMap)

var svg = d3.select('#map').select('svg');
var nodeLinkG = svg.select('g')
    .attr('class', 'leaflet-zoom-hide');

Promise.all([
    d3.csv('./storms_expanded.csv', function(row) {
        var node = {v_id: +row[''], year: +row['year'], name: row['corrected_name'], LatLng: [+row['lat'], +row['long']], category: +row['category'],
            datetime: row['datetimes'], elapsedDays: +row['elapsed_days']};
        vertices.set(node.v_id, node);
        nodeFeatures.push(turf.point([+row['long'], +row['lat']], node));
        return node;
    }),
]).then(function(data) {
    var nodes = data[0];
    readyToDraw(nodes)
});

function readyToDraw(nodes) {

    var yearExtent = d3.extent(nodes, function (d) {return d.year});
    var nodeTypes = d3.map(nodes, function(d){return d.category;}).keys();

    for(let year = yearExtent[0]; year <= yearExtent[1]; year++) {
        newYear = document.createElement('option');
        newYear.value = year;
        newYear.textContent = year.toString();
        elem.appendChild(newYear);
    }

    var colorScale = d3.scaleSequential()
        .domain([0,50])
        .interpolator(d3.interpolate("purple", "orange"));

    var radiusScale = d3.scaleLinear().range([0,15]).domain([-1,5])

    nodeLinkG.selectAll('.grid-node')
        .data(nodes)
        .enter().append('circle')
        .attr('class', 'grid-node')
        .style('fill', function(d) {
          return colorScale(d['elapsedDays']);
        })
        .style('fill-opacity', 0)
        .attr('r', function(d) {
          return radiusScale(d['category']);
        }); 

    myMap.on('zoomend', updateLayers);
    updateLayers();
}

function onSelectChange() {
    filterYear = this.value;

    updateLayers();
}

function updateLayers(){
    console.log(filterYear);

    nodeLinkG.selectAll('.grid-node')
      .style('fill-opacity', 0)
      .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
      .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})

    nodeLinkG.selectAll('.grid-node')
      .filter(function (d) {return (d['year'] == filterYear)})
      .style('fill-opacity', 0.6)
      .attr('cx', function(d){return myMap.latLngToLayerPoint(d.LatLng).x})
      .attr('cy', function(d){return myMap.latLngToLayerPoint(d.LatLng).y})
    // nodeLinkG.selectAll('.grid-link')
    //   .attr('x1', function(d){return myMap.latLngToLayerPoint(d.node1.LatLng).x})
    //   .attr('y1', function(d){return myMap.latLngToLayerPoint(d.node1.LatLng).y})
    //   .attr('x2', function(d){return myMap.latLngToLayerPoint(d.node2.LatLng).x})
    //   .attr('y2', function(d){return myMap.latLngToLayerPoint(d.node2.LatLng).y});
      
};