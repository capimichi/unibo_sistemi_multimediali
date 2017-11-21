var chartContainer = d3.select("#chart-container");

// Set the dimensions of the canvas / graph
var margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 50
};

var width = 900 - margin.left - margin.right;

var height = 600 - margin.top - margin.bottom;

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .html('<i class="fa fa-times"></i> <br/><a href="#">Informazioni generiche per anno <span class="year"></span> </a> <br/><a href="#">Informazioni specifiche <span class="status"></span> per anno <span class="year"></span> </a> <br/><a href="#">Informazioni generiche <span class="status"></span> </a>');


var cd = window.cd || {};

/**
 * Fetch lines from csv
 *
 * @param data
 * @returns {{}}
 */
cd.fetchLines = function (data) {
    var lines = {};
    data.forEach(function (row) {
        var i = 0;
        var x = null;
        for (var key in row) {
            var field = row[key];
            if (i === 0) {
                x = field;
            } else {
                var point = {
                    x: x,
                    y: field
                };
                if (typeof lines[key] === 'undefined') {
                    lines[key] = [];
                }
                lines[key].push(point);
            }
            i++;
        }
    });
    return lines;
};




cd.openOccupazioneNonStoricoGraph = function () {

    var x = d3.scale
        .linear()
        .range([0, width]);

    var y = d3.scale
        .linear()
        .range([height, 0]);

    var xAxis = d3
        .svg
        .axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.format("d"))
        .tickSubdivide(0);

    var yAxis = d3
        .svg
        .axis()
        .scale(y)
        .orient("left").ticks(20);

    var drawLine = d3.svg
        .line()
        .x(function (d) {
            return x(d.x);
        })
        .y(function (d) {
            return y(d.y);
        });

    var svg = chartContainer
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/occupazione_non.csv", function (error, data) {

        x.domain([
            d3.min(data, function (d) {
                return d.date;
            }),
            d3.max(data, function (d) {
                return d.date;
            })
        ]);

        y.domain([0, 100]);

        var lines = cd.fetchLines(data);

        for (var key in lines) {

            var line = lines[key];

            svg.append("path")
                .attr("class", "line " + key)
                .attr("d", drawLine(line));


            svg.selectAll("dot")
                .data(line)
                .enter()
                .append("circle")
                .attr("class", "circle " + key)
                .attr("r", 5)
                .attr("cx", function (d) {
                    return x(d.x);
                })
                .attr("cy", function (d) {
                    return y(d.y);
                })
                .on("click", function (d) {
                    console.log(d);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    tooltip.selectAll(".year").text(d.x);
                    tooltip.selectAll(".status").text(key);
                })
                .on("mousehover", function (d) {
                    var dot = d3.select(this);
                    dot.classed("hover", true);
                })
                .on("mouseout", function (d) {
                    var dot = d3.select(this);
                    dot.classed("hover", false);
                });
        }

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    });
};

cd.openOccupazioneMotivazioneStoricoGraph = function () {


};

cd.openOccupazioneTempisticheStoricoGraph = function () {


};

cd.openDisoccupazioneStoricoGraph = function () {


};

cd.openOccupazioneNonStoricoGraph();

