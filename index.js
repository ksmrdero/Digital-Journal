// set the dimensions and margins of the graph
var svg = d3.select("svg"),
  margin = { top: 40, right: 170, bottom: 30, left: 60 };
width = 1000 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;


function getTime(num) {
  var percent = (num / 100) * 24
  var decimalTime = parseFloat(percent);
  decimalTime = decimalTime * 60 * 60;
  var hours = Math.floor((decimalTime / (60 * 60)));
  decimalTime = decimalTime - (hours * 60 * 60);
  var minutes = Math.floor((decimalTime / 60));

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  return (hours + " Hrs " + minutes + " Min (" + num + "%)")
}

d3.selectAll("input[name='time']").on("change", function () {
  $("#my_dataviz").empty();
  console.log(this.id);
  draw(this.id);
  curr_stock = this.id;
});
draw('month')
function draw(time) {
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  // Parse the Data
  d3.csv(`data/${time}_avg.csv`, function (data) {

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.group) }).keys()

    // Add X axis
    var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add X Axis Text
    svg.append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add Y Axis Text
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Percent of Time Spent");

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#7e9a9a', '#7e4a35', '#2a6592', '#FF5733', '#D5A82D', '#8AD52D', '#2DD5BD', '#A62DD5', '#D52D86', '#D1172A'])

    // Normalize the data -> sum of each group must be 100!
    console.log(data)
    dataNormalized = []
    data.forEach(function (d) {
      // Compute the total
      tot = 0
      for (i in subgroups) { name = subgroups[i]; tot += +d[name] }
      // Now normalize
      for (i in subgroups) {
        name = subgroups[i];
        d[name] = d[name] / tot * 100
      }
    })


    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups)
      (data)

    // Show the bars
    svg.append("g").selectAll("g")
      // Enter in the stack data = loop key per key = group per group
      .data(stackedData)
      .enter().append("g")
      .attr("fill", function (d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function (d) { return d; })
      .enter().append("rect")
      .attr("x", function (d) { return x(d.data.group); })
      .attr("y", function (d) { return y(d[1]); })
      .attr("height", function (d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth())
      .on("mouseover", function () { tooltip.style("display", null); })
      .on("mouseout", function () { tooltip.style("display", "none"); })
      .on("mousemove", function (d) {
        var xPosition = d3.mouse(this)[0] - 15;
        var yPosition = d3.mouse(this)[1] - 25;
        tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
        tooltip.select("text").text(getTime(Math.round((d[1] - d[0]) * 100) / 100))
        
      });

    var colors = ['#7e9a9a', '#7e4a35', '#2a6592', '#FF5733', '#D5A82D', '#8AD52D', '#2DD5BD', '#A62DD5', '#D52D86', '#D1172A'].reverse();

    // Draw legend
    var legend = svg.selectAll(".legend")
      .data(colors)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(30," + i * 19 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d, i) { return colors.slice().reverse()[i]; });

    legend.append("text")
      .attr("x", width + 5)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .style("text-anchor", "start")
      .text(function (d, i) {
        switch (i) {
          case 0: return "Sleep";
          case 1: return "Personal Care";
          case 2: return "Household Activities";
          case 3: return "Work";
          case 4: return "Education";
          case 5: return "Shopping";
          case 6: return "Eating/Drinking";
          case 7: return "Leisure";
          case 8: return "Athletics";
          case 9: return "Other";
        }
      });

    // Tooltip Text + Box
    var tooltip = svg.append("g")
      .attr("class", "tooltip")
      .style("display", "none");

    tooltip.append("rect")
      .attr("width", 30)
      .attr("height", 20)
      .attr("fill", "white")
      .style("opacity", 0.7);

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .style("text-alignment", "center")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");
  })
}
