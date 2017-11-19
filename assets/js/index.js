var chartContainer = d3.select("#chart-container");

var margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 50
};

var width = 900 - margin.left - margin.right;

var height = 600 - margin.top - margin.bottom;

var x = d3.scale
    .linear()
    .range([0, width]);
var y = d3.scale
    .linear()
    .range([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format("d")).tickSubdivide(0);
var yAxis = d3.svg.axis().scale(y).orient("left").ticks(20);

var svg = chartContainer.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("generale.csv", function (error, data) {

    x.domain([
        d3.min(data, function (d) {
            return d.date;
        }),
        d3.max(data, function (d) {
            return d.date;
        })
    ]);
    y.domain([0, 100]);


    // Add the valueline path.
    svg.append("path")
        .attr("class", "line occupati")
        .attr("d", occupatiLine(data));

    // Add the valueline path.
    svg.append("path")
        .attr("class", "line non_occupati")
        .attr("d", nonOccupatiLine(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle occupati")
        .attr("r", 5)
        .attr("cx", function (d) {
            return x(d.date);
        })
        .attr("cy", function (d) {
            return y(d.occupati);
        })
        .on("mouseover", function (d) {
            var dot = d3.select(this);
            dot.classed("hover", true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>Anno</strong><div>" + d.date + "</div><hr/><strong>Occupati</strong><div>" + d.occupati + "%</div>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function (d) {
            var dot = d3.select(this);
            dot.classed("hover", false);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle non_occupati")
        .attr("r", 5)
        .attr("cx", function (d) {
            return x(d.date);
        })
        .attr("cy", function (d) {
            return y(d.non_occupati);
        })
        .on("mouseover", function (d) {
            var dot = d3.select(this);
            dot.classed("hover", true);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>Anno</strong><div>" + d.date + "</div><hr/><strong>Non occupati</strong><div>" + d.non_occupati + "%</div>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function (d) {
            var dot = d3.select(this);
            dot.classed("hover", false);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
});