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

cd.colors = [
    "#D84512",
    "#D88012",
    "#F2693A",
    "#F2C23A",
    "#6133A5",
    "#2C6F9B",
    "#28A96B",
    "#85DA34",
    "#D6336A",
    "#F3A139",
    "#96279E"
];


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

cd.changeInfoControl = function (rows) {

    cd.infoContainer.html("");

    var ul = cd.infoContainer.append("ul");

    rows.forEach(function (row) {

        var li = ul.append("li");

        li.text(row.text);

        var btn = li.append("button");

        btn.text("Mostra")
            .on('click', row.callback)
    });
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

        console.log(lines);

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


cd.pieChartData = {};

cd.pieChartData.drawPieChart = function (year, csvPath, clickCallback) {

    d3.csv(csvPath, function (error, data) {

        var radius = 200;

        cd.chartContainer.html("");

        var svg = cd.chartContainer
            .append("svg")
            .attr("width", cd.width + cd.margin.left + cd.margin.right)
            .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + cd.width / 2 + "," + cd.height / 2 + ")");

        var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });


        var lines = cd.fetchLines(data);

        console.log(lines);

        var dataSet = [];

        var i = 0;

        for (var key in lines) {

            var line = lines[key];

            var value = null;
            line.forEach(function (coodinate) {
                if (parseInt(coodinate.x) === parseInt(year)) {

                    value = coodinate.y;
                }
            });

            dataSet.push({
                legend: key,
                value: value,
                color: cd.colors[i++]
            });
        }

        var g = svg.selectAll(".fan")
            .data(pie(dataSet))
            .enter()
            .append("g")
            .attr("class", "fan");

        g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return d.data.color;
            });

        g.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.data.legend;
            });
    });


};

cd.openOccupazioneNonStoricoGraph = function () {

    cd.changeInfoControl([]);

    cd.lineChartData.drawLineChart('data/occupazione_non.csv', function (d) {

        if (d.circle.classed("occupati")) {

            var rows = [
                {
                    text: 'Informazioni storico facoltà',
                    callback: cd.openOccupazioneFacoltaStoricoGraph
                },
                {
                    text: 'Informazioni storico tempistiche',
                    callback: cd.openOccupazioneTempisticheStoricoGraph
                },
                {
                    text: 'Informazioni \"occupati / non\" anno ' + d.x,
                    callback: null
                }
            ];


        }

        if (d.circle.classed("non_occupati")) {

            var rows = [
                {
                    text: 'Informazioni storico disoccupazione',
                    callback: cd.openDisoccupazioneStoricoGraph
                },
                {
                    text: 'Informazioni \"occupati / non\" anno ' + d.x,
                    callback: null
                }
            ];

        }

        cd.changeInfoControl(rows);

    });

};

cd.openOccupazioneFacoltaStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico \"occupati / non\"',
            callback: cd.openOccupazioneNonStoricoGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/occupazione_facolta.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni facoltà anno ' + d.x,
                callback: function () {
                    cd.openOccupazioneFacoltaAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\"',
                callback: cd.openOccupazioneNonStoricoGraph
            }
        ];

        cd.changeInfoControl(rows);

    });

};

cd.openOccupazioneTempisticheStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico \"occupati / non\"',
            callback: cd.openOccupazioneNonStoricoGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/occupazione_tempistiche.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni tempistiche anno ' + d.x,
                callback: null
            },
            {
                text: 'Informazioni storico \"occupati / non\"',
                callback: cd.openOccupazioneNonStoricoGraph
            }
        ];

        cd.changeInfoControl(rows);

    });

};

cd.openDisoccupazioneStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico \"occupati / non\"',
            callback: cd.openOccupazioneNonStoricoGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/disoccupazione.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni disoccupazione anno ' + d.x,
                callback: function (a) {
                    cd.openDisoccupazioneAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\"',
                callback: cd.openOccupazioneNonStoricoGraph
            }
        ];

        cd.changeInfoControl(rows);

    });

};

cd.openDisoccupazioneAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico disoccupazione',
            callback: cd.openDisoccupazioneStoricoGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/disoccupazione.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openOccupazioneFacoltaAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico facoltà',
            callback: cd.openOccupazioneFacoltaStoricoGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/occupazione_facolta.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openOccupazioneTempisticheAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico tempistiche',
            callback: cd.openOccupazioneTempisticheStoricoGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/occupazione_tempistiche.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openOccupazioneNonStoricoGraph();

// setTimeout(function () {
//     cd.openOccupazioneFacoltaStoricoGraph();
// }, 2000);