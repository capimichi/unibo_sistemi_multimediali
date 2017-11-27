var cd = window.cd || {};

cd.chartContainer = d3.select("#chart-container");

cd.infoContainer = d3.select("#info");

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

    var yMax = d3.max(yMaxes, function (d) {
        return parseFloat(d);
    });

    console.log(yMax);

    return yMax;
};

/**
 *
 * @param lines
 * @returns {number}
 */
cd.getMinLinesY = function (lines) {

    var yMins = [];

    for (var key in lines) {

        var line = lines[key];

        var yMin = d3.min(line, function (d) {
            return parseFloat(d.y);
        });

        yMins.push(yMin);
    }

    var yMin = d3.min(yMins, function (d) {
        return parseFloat(d);
    });


    return yMin;
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


cd.lineChartData.drawLineChart = function (csvPath, clickCallback) {

    d3.csv(csvPath, function (error, data) {

        cd.chartContainer.html("");

        var svg = cd.chartContainer
            .append("svg")
            .attr("width", cd.width + cd.margin.left + cd.margin.right)
            .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + cd.margin.left + "," + cd.margin.top + ")");

        cd.lineChartData.x.domain([
            d3.min(data, function (d) {
                return d.date;
            }),
            d3.max(data, function (d) {
                return d.date;
            })
        ]);

        var lines = cd.fetchLines(data);

        cd.lineChartData.y.domain([
            cd.getMinLinesY(lines), cd.getMaxLinesY(lines)
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
                });
            // .on("click", function (d) {
            //     console.log(key);
            //     return clickCallback({
            //         'year': d.x,
            //         'label': key,
            //         'value': d.y
            //     })
            // });
        }

        svg.selectAll('circle')
            .on('click', function (d) {

                var t = d3.select(this);

                clickCallback({
                    circle: t,
                    x: d.x,
                    y: d.y
                });
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + cd.height + ")")
            .call(cd.lineChartData.xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(cd.lineChartData.yAxis);
    });
};

cd.openOccupazioneNonStoricoGraph = function () {

    cd.lineChartData.drawLineChart('data/occupazione_non.csv', function (d) {

        if (d.circle.classed("occupati")) {

            var html = "<ul><li>Informazioni storico facoltà &nbsp; <button>Mostra</button></li><li>Informazioni storico tempistiche &nbsp; <button>Mostra</button></li><li>Informazioni \"occupati / non\" anno {anno} &nbsp; <button>Mostra</button></li></ul>";
        }

        if (d.circle.classed("non_occupati")) {

            var html = "<ul><li>Informazioni storico disoccupazione &nbsp; <button>Mostra</button></li><li>Informazioni \"occupati / non\" anno {anno} &nbsp; <button>Mostra</button></li></ul>";
        }

        html = html.replace(/{anno}/g, d.x);

        cd.infoContainer.html(html);

    });

};

cd.openOccupazioneFacoltaStoricoGraph = function () {

    cd.lineChartData.drawLineChart('data/occupazione_facolta.csv');

};

cd.openOccupazioneTempisticheStoricoGraph = function () {


};

cd.openDisoccupazioneStoricoGraph = function () {


};

cd.openOccupazioneNonStoricoGraph();

// setTimeout(function () {
//     cd.openOccupazioneFacoltaStoricoGraph();
// }, 2000);