var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y %b %d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var stack = d3.stack();

var area = d3.area()
    .x(function(d, i) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./storms.csv").then(function(data) {
  data = easySet(data) 
  var keys = Object.keys(data[0]);
//   console.log(data[0].category)
//   console.log(easySet(data))
  console.log(data)
  console.log(area)

  x.domain(d3.extent(data, function(d) { return d.year; }));
  z.domain(keys);
  stack.keys(keys);

  var layer = g.selectAll(".layer")
    .data(stack(data))
    .enter().append("g")
      .attr("class", "layer");

  layer.append("path")
      .attr("class", "area")
      .style("fill", function(d) { return z(d.key); })
      .attr("d", area);

  layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
    .append("text")
      .attr("x", width - 6)
      .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
      .attr("dy", ".35em")
      .style("font", "10px sans-serif")
      .style("text-anchor", "end")
      .text(function(d) { return d.key; });

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(d3.scaleLinear().range([1975, 2020])));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"));
});

function type(d, i, columns) {
  d.date = parseDate(d.date);
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]] / 100;
  return d;
}

function easySet(d){
    let out = []
    for (let i = 1975; i <= 2020; i++){
       out.push({"-1":0, "0": 0, "1":0, "2":0, "3":0, "4":0, "5":0})
       for(let j of d){
            if(+j.year === i){
               out[i-1975][j.category]++ 
            }
       } 
    }
    for(let year = 0; year < out.length; year++) {
        let total = out[year]["-1"] + out[year]["0"] + out[year]["1"] + out[year]["2"] + out[year]['3'] + out[year]['4'] + out[year]['5']
        const opts = ["-1", "0", "1", "2", "3", "4", "5"]
        for(let i of opts){
            out[year][i] = out[year][i]/total
        }
        out[year]["total"] = total
        out[year]["year"] = year+1975
        
    }
    return out
}