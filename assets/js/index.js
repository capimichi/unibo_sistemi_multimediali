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


        var occupatiLineData = [];
        var nonOccupatiLineData = [];

        data.forEach(function (p1, p2, p3) {
            occupatiLineData.push({
                x: p1.date,
                y: p1.occupati
            });
            nonOccupatiLineData.push({
                x: p1.date,
                y: p1.non_occupati
            });
        });

        svg.append("path")
            .attr("class", "line occupati")
            .attr("d", drawLine(occupatiLineData));

        svg.append("path")
            .attr("class", "line non_occupati")
            .attr("d", drawLine(nonOccupatiLineData));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var statuses = Object.keys(data[0]);

        statuses.shift();

        statuses.forEach(function (p1, p2, p3) {
            svg.selectAll("dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "circle " + p1)
                .attr("r", 5)
                .attr("cx", function (d) {
                    return x(d.date);
                })
                .attr("cy", function (d) {
                    return y(d[p1]);
                })
                .on("click", function (d) {
                    console.log(d);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    tooltip.selectAll(".year").text(d.date);
                    tooltip.selectAll(".status").text(p1);
                })
                .on("mousehover", function (d) {
                    var dot = d3.select(this);
                    dot.classed("hover", true);
                })
                .on("mouseout", function (d) {
                    var dot = d3.select(this);
                    dot.classed("hover", false);
                });
        });
    });
};

cd.openOccupazioneMotivazioneStoricoGraph = function () {


};

cd.openOccupazioneTempisticheStoricoGraph = function () {


};

cd.openDisoccupazioneStoricoGraph = function () {


};

cd.openOccupazioneNonStoricoGraph();

