var svg = d3.select("#months"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y %b %d");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]).domain([0, 10000]),
    z = d3.scaleOrdinal(d3.schemeCategory10);
console.log(height)

var stack = d3.stack();

var area = d3.area()
    .x(function(d, i) { return x(d.data.month); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); });

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append('text')
.attr('class', 'title')
.attr('transform', 'translate('+[410, 15]+')')
.text('Storm Category Frequency By Month');

svg.append('text')
.attr('class', 'xaxis')
.attr('transform', 'translate('+[470, 500]+')')
.text('Month');

svg.append('text')
.attr('class', 'yaxis')
.attr('transform', 'translate('+[0, 225]+')')
.text('Count');

d3.csv("./storms.csv").then(function(data) {
  data = easySet(data) 
  console.log(data)
  var keys = Object.keys(data[0]);

  x.domain(d3.extent(data, function(d) { return d.month; }));
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
      .call(d3.axisBottom(x).tickFormat(function(d){ switch (d * 1){
          case 0: return "Jan"
          case 1: return "Feb"
          case 2: return "Mar"
          case 3: return "Apr"
          case 4: return "May"
          case 5: return "Jun"
          case 6: return "Jul"
          case 7: return "Aug"
          case 8: return "Sep"
          case 9: return "Oct"
          case 10: return "Nov"
          case 11: return "Dec" 
      }}));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10));
});

function conv(x){
    return x * 1000
}

function type(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = d[columns[i]] / 100;
  return d;
}

function easySet(d){
    let out = []
    for (let i = 1; i <= 12; i++){
       out.push({"-1":0, "0": 0, "1":0, "2":0, "3":0, "4":0, "5":0})
       for(let j of d){
            if(+j.month === i){
               out[i-1][j.category]++ 
            }
       } 
    }
    for(let month = 0; month < out.length; month++) {
        let total = out[month]["-1"] + out[month]["0"] + out[month]["1"] + out[month]["2"] + out[month]['3'] + out[month]['4'] + out[month]['5']
        const opts = ["-1", "0", "1", "2", "3", "4", "5"]
        for(let i of opts){
            // out[month][i] = out[month][i]
            if(total === 0){
                out[month][i] = 0
            }
            else{
            out[month][i] = out[month][i]
            }
        }
        out[month]["total"] = total
        out[month]["month"] = month
        
    }
    return out
}