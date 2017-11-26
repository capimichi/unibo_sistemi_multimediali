var cd = window.cd || {};

cd.chartContainer = d3.select("#chart-container");

cd.toolTips = {
    indexLine: d3.select("body")
        .append("div")
        .attr("class", "tooltip indexTooltip")
        .style("opacity", 0)
        .html('<i class="fa fa-times"></i> <br/><a href="#">Informazioni generiche per anno <span class="year"></span> </a> <br/><a href="#">Informazioni specifiche <span class="status"></span> per anno <span class="year"></span> </a> <br/><a href="#">Informazioni generiche <span class="status"></span> </a>'),
    facoltaLine: d3.select("body")
        .append("div")
        .attr("class", "tooltip facoltaTooltip")
        .style("opacity", 0)
        .html('<i class="fa fa-times"></i> <br/><a href="#">Informazioni specifiche <span class="status"></span> per anno <span class="year"></span> </a> <br/><a href="#">Informazioni generiche <span class="status"></span> </a>')
};

cd.margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 50
};

cd.width = 900 - cd.margin.left - cd.margin.right;
cd.height = 600 - cd.margin.top - cd.margin.bottom;


/**
 *
 * @param lines
 * @returns {number}
 */
cd.getMaxLinesY = function (lines) {

    var yMaxes = [];

    for (var key in lines) {

        var line = lines[key];

        var yMax = d3.max(line, function (d) {
            return parseFloat(d.y);
        });

        yMaxes.push(yMax);
    }

    console.log(yMaxes);

    var yMax = d3.max(yMaxes, function (d) {
        return parseFloat(d);
    });

    console.log(yMax);

    return yMax;
};

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
                var slug = key.replace(/ /g, "_");
                if (typeof lines[slug] === 'undefined') {
                    lines[slug] = [];
                }
                lines[slug].push(point);
            }
            i++;
        }
    });
    return lines;
};


cd.lineChartData = {
    x: d3.scale.linear().range([0, cd.width]),
    y: d3.scale.linear().range([cd.height, 0]),
};

cd.lineChartData.xAxis = d3.svg.axis().scale(cd.lineChartData.x).orient("bottom").tickFormat(d3.format("d")).tickSubdivide(0);
cd.lineChartData.yAxis = d3.svg.axis().scale(cd.lineChartData.y).orient("left").ticks(20);

cd.lineChartData.drawLine = d3.svg.line()
    .x(function (d) {
        var v = cd.lineChartData.x(d.x);
        return v;
    })
    .y(function (d) {
        return cd.lineChartData.y(d.y);
    });


cd.openOccupazioneNonStoricoGraph = function () {

    cd.chartContainer.html("");

    var svg = cd.chartContainer
        .append("svg")
        .attr("width", cd.width + cd.margin.left + cd.margin.right)
        .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + cd.margin.left + "," + cd.margin.top + ")");

    d3.csv("data/occupazione_non.csv", function (error, data) {

        cd.lineChartData.x.domain([
            d3.min(data, function (d) {
                return d.date;
            }),
            d3.max(data, function (d) {
                return d.date;
            })
        ]);

        cd.lineChartData.y.domain([0, 100]);

        var lines = cd.fetchLines(data);

        for (var key in lines) {

            var line = lines[key];

            svg.append("path")
                .attr("class", "line " + key)
                .attr("d", cd.lineChartData.drawLine(line));


            svg.selectAll("dot")
                .data(line)
                .enter()
                .append("circle")
                .attr("class", "circle " + key)
                .attr("r", 5)
                .attr("cx", function (d) {
                    return cd.lineChartData.x(d.x);
                })
                .attr("cy", function (d) {
                    return cd.lineChartData.y(d.y);
                })
                .on("click", function (d) {
                    console.log(d);
                    cd.toolTips.indexLine.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    cd.toolTips.indexLine.selectAll(".year").text(d.x);
                    cd.toolTips.indexLine.selectAll(".status").text(key);
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
            .attr("transform", "translate(0," + cd.height + ")")
            .call(cd.lineChartData.xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(cd.lineChartData.yAxis);
    });
};

cd.openOccupazioneFacoltaStoricoGraph = function () {

    cd.chartContainer.html("");

    var svg = cd.chartContainer
        .append("svg")
        .attr("width", cd.width + cd.margin.left + cd.margin.right)
        .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + cd.margin.left + "," + cd.margin.top + ")");

    d3.csv("data/occupazione_facolta.csv", function (error, data) {

        cd.lineChartData.x.domain([
            d3.min(data, function (d) {
                return d.date;
            }),
            d3.max(data, function (d) {
                return d.date;
            })
        ]);

        cd.lineChartData.y.domain([
            0, 100
        ]);

        var lines = cd.fetchLines(data);

        cd.lineChartData.y.domain([
            0, cd.getMaxLinesY(lines)
        ]);

        for (var key in lines) {

            var line = lines[key];

            svg.append("path")
                .attr("class", "line " + key)
                .attr("d", cd.lineChartData.drawLine(line));


            svg.selectAll("dot")
                .data(line)
                .enter()
                .append("circle")
                .attr("class", "circle " + key)
                .attr("r", 5)
                .attr("cx", function (d) {
                    return cd.lineChartData.x(d.x);
                })
                .attr("cy", function (d) {
                    return cd.lineChartData.y(d.y);
                })
                .on("click", function (d) {
                    cd.toolTips.facoltaLine.transition()
                        .duration(200)
                        .style("opacity", .9)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                    cd.toolTips.facoltaLine.selectAll(".year").text(d.x);
                    cd.toolTips.facoltaLine.selectAll(".status").text(key);
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
            .attr("transform", "translate(0," + cd.height + ")")
            .call(cd.lineChartData.xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(cd.lineChartData.yAxis);
    });

};

cd.openOccupazioneTempisticheStoricoGraph = function () {


};

cd.openDisoccupazioneStoricoGraph = function () {


};

cd.openOccupazioneNonStoricoGraph();

// setTimeout(function () {
cd.openOccupazioneFacoltaStoricoGraph();
// }, 2000);