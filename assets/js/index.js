var cd = window.cd || {};

cd.chartContainer = d3.select("#chart-container");

cd.legendContainer = d3.select("#legend");

cd.infoContainer = d3.select("#info");

cd.margin = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 50
};

cd.width = d3.select('#legend-container').node().getBoundingClientRect().width - cd.margin.left - cd.margin.right;

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

        cd.lineChartData.y.domain([
            cd.getMinLinesY(lines), cd.getMaxLinesY(lines)
        ]);

        cd.legendContainer.html('');

        var colorIndex = 0;

        for (var key in lines) {

            var color = cd.colors[colorIndex];

            colorIndex++;

            var line = lines[key];

            cd.legendContainer
                .append('li')
                .text(key.replace(/_/g, ' '))
                .style('background-color', color)
            ;

            svg.append("path")
                .style('stroke', color)
                .attr("class", "line " + key)
                .attr("d", cd.lineChartData.drawLine(line));

            svg.selectAll("dot")
                .data(line)
                .enter()
                .append("circle")
                .style('stroke', color)
                .style('fill', color)
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

    cd.legendContainer.html('');

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

        var dataSet = [];

        var i = 0;

        cd.legendContainer.html('');

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

        dataSet.forEach(function (item) {
            console.log(item);
            cd.legendContainer
                .append('li')
                .text(item.legend.replace(/_/g, ' '))
                .style('background-color', item.color)
            ;
        });

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

        // g.append("text")
        //     .attr("transform", function (d) {
        //         return "translate(" + arc.centroid(d) + ")";
        //     })
        //     .style("text-anchor", "middle")
        //     .text(function (d) {
        //         return d.data.legend;
        //     });
    });
};

cd.histogramChartData = {};

cd.histogramChartData = {
    x: d3.scale.ordinal().rangeRoundBands([0, cd.width]),
    y: d3.scale.linear().rangeRound([cd.height, 0]),
    z: d3.scale.category10()
};

cd.histogramChartData.xAxis = d3.svg.axis().scale(cd.histogramChartData.x).orient("bottom").tickFormat(d3.time.format("%b"))
cd.histogramChartData.yAxis = d3.svg.axis().scale(cd.histogramChartData.y).orient("right");


cd.histogramChartData.drawHistogramChart = function (csvPath, clickCallback) {

    cd.legendContainer.html('');

    cd.chartContainer.html("");

    d3.csv(csvPath, function (error, data) {

        var svg = cd.chartContainer
            .append("svg")
            .attr("width", cd.width + cd.margin.left + cd.margin.right)
            .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + cd.margin.left + "," + cd.margin.top + ")");

        var x0 = d3.scale.ordinal()
            .rangeRoundBands([0, cd.width], .1);

        var x1 = d3.scale.ordinal();

        var y = d3.scale.linear()
            .range([cd.height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x0)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));

        var dataset = data;

        var options = d3.keys(dataset[0]).filter(function (key) {
            return key !== "date";
        });

        dataset.forEach(function (d) {
            d.valores = options.map(function (name) {
                return {name: name, value: +d[name]};
            });
        });

        x0.domain(dataset.map(function (d) {
            return d.date;
        }));
        x1.domain(options).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, 100]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + cd.height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end");

        var bar = svg.selectAll(".bar")
            .data(dataset)
            .enter().append("g")
            .attr("class", "rect")
            .attr("transform", function (d) {
                return "translate(" + x0(d.date) + ",0)";
            });

        var legendColors = {};

        bar.selectAll("rect")
            .data(function (d) {

                var valores = d.valores;

                for (var i = 0; i < valores.length; i++) {
                    valores[i].date = d.date;
                }
                return valores;
            })
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function (d) {
                return x1(d.name);
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("value", function (d) {
                return d.name;
            })
            .attr("class", function (d) {
                return d.name;
            })
            .attr("height", function (d) {
                return cd.height - y(d.value);
            })
            .style("fill", function (d, index) {

                legendColors[d.name] = cd.colors[index];
                return cd.colors[index];
            });


        for (var key in legendColors) {

            var color = legendColors[key];

            cd.legendContainer
                .append('li')
                .text(key.replace(/_/g, ' '))
                .style('background-color', color)
            ;
        }

        bar.selectAll("rect")
            .on('click', function (d) {
                var t = d3.select(this);

                clickCallback({
                    item: t[0][0],
                    x: d.date,
                });
            });


    });
};

cd.openOccupazioneNonStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico "occupati/non" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/occupazione_non.csv', function (d) {

        if (d.circle.classed("occupati")) {

            var rows = [
                {
                    text: 'Informazioni storico "occupati/non" a barre',
                    callback: cd.openOccupazioneNonStoricoHistogramGraph
                },
                {
                    text: 'Informazioni storico facoltà a linee',
                    callback: cd.openOccupazioneFacoltaStoricoGraph
                },
                {
                    text: 'Informazioni storico facoltà a barre',
                    callback: cd.openOccupazioneFacoltaStoricoHistogramGraph
                },
                {
                    text: 'Informazioni storico tempistiche a linee',
                    callback: cd.openOccupazioneTempisticheStoricoGraph
                },
                {
                    text: 'Informazioni storico tempistiche a barre',
                    callback: cd.openOccupazioneTempisticheStoricoHistogramGraph
                },
                {
                    text: 'Informazioni \"occupati / non\" anno ' + d.x,
                    callback: function () {
                        cd.openOccupazioneNonAnnoGraph(d.x);
                    }
                }
            ];


        }

        if (d.circle.classed("non_occupati")) {

            var rows = [
                {
                    text: 'Informazioni storico "occupati/non" a barre',
                    callback: cd.openOccupazioneNonStoricoHistogramGraph
                },
                {
                    text: 'Informazioni storico disoccupazione a linee',
                    callback: cd.openDisoccupazioneStoricoGraph
                },
                {
                    text: 'Informazioni storico disoccupazione a barre',
                    callback: cd.openDisoccupazioneStoricoHistogramGraph
                },
                {
                    text: 'Informazioni \"occupati / non\" anno ' + d.x,
                    callback: function () {
                        cd.openOccupazioneNonAnnoGraph(d.x);
                    }
                }
            ];

        }

        cd.changeInfoControl(rows);
    });
};


cd.openOccupazioneNonStoricoHistogramGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico "occupati/non" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        }
    ]);

    cd.histogramChartData.drawHistogramChart('data/occupazione_non.csv', function (d) {

            if (d.item.className.baseVal === "occupati") {

                var rows = [
                    {
                        text: 'Informazioni storico "occupati/non" a linee',
                        callback: cd.openOccupazioneNonStoricoGraph
                    },
                    {
                        text: 'Informazioni storico facoltà a linee',
                        callback: cd.openOccupazioneFacoltaStoricoGraph
                    },
                    {
                        text: 'Informazioni storico facoltà a barre',
                        callback: cd.openOccupazioneFacoltaStoricoHistogramGraph
                    },
                    {
                        text: 'Informazioni storico tempistiche a linee',
                        callback: cd.openOccupazioneTempisticheStoricoGraph
                    },
                    {
                        text: 'Informazioni storico tempistiche a barre',
                        callback: cd.openOccupazioneTempisticheStoricoHistogramGraph
                    },
                    {
                        text: 'Informazioni \"occupati / non\" anno ' + d.x,
                        callback: function () {
                            cd.openOccupazioneNonAnnoGraph(d.x);
                        }
                    }
                ];
            }

            if (d.item.className.baseVal === "non_occupati") {

                var rows = [
                    {
                        text: 'Informazioni storico "occupati/non" a linee',
                        callback: cd.openOccupazioneNonStoricoGraph
                    },
                    {
                        text: 'Informazioni storico disoccupazione a linee',
                        callback: cd.openDisoccupazioneStoricoGraph
                    },
                    {
                        text: 'Informazioni storico disoccupazione a barre',
                        callback: cd.openDisoccupazioneStoricoHistogramGraph
                    },
                    {
                        text: 'Informazioni \"occupati / non\" anno ' + d.x,
                        callback: function () {
                            cd.openOccupazioneNonAnnoGraph(d.x);
                        }
                    }
                ];
            }

            cd.changeInfoControl(rows);
        }
    );
};

cd.openOccupazioneFacoltaStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico facolta a barre',
            callback: cd.openOccupazioneFacoltaStoricoHistogramGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/occupazione_facolta.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico facolta a barre',
                callback: cd.openOccupazioneFacoltaStoricoHistogramGraph
            },
            {
                text: 'Informazioni facoltà anno ' + d.x,
                callback: function () {
                    cd.openOccupazioneFacoltaAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);

    });

};

cd.openOccupazioneFacoltaStoricoHistogramGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico facolta a linee',
            callback: cd.openOccupazioneFacoltaStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.histogramChartData.drawHistogramChart('data/occupazione_facolta.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico facolta a linee',
                callback: cd.openOccupazioneFacoltaStoricoGraph
            },
            {
                text: 'Informazioni facoltà anno ' + d.x,
                callback: function () {
                    cd.openOccupazioneFacoltaAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);

    });

};

cd.openOccupazioneTempisticheStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico tempistiche a barre',
            callback: cd.openOccupazioneTempisticheStoricoHistogramGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }

    ]);

    cd.lineChartData.drawLineChart('data/occupazione_tempistiche.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico tempistiche a barre',
                callback: cd.openOccupazioneTempisticheStoricoHistogramGraph
            },
            {
                text: 'Informazioni tempistiche anno ' + d.x,
                callback: function () {
                    cd.openOccupazioneTempisticheAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);
    });
};

cd.openOccupazioneTempisticheStoricoHistogramGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico tempistiche a linee',
            callback: cd.openOccupazioneTempisticheStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.histogramChartData.drawHistogramChart('data/occupazione_tempistiche.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico tempistiche a linee',
                callback: cd.openOccupazioneTempisticheStoricoGraph
            },
            {
                text: 'Informazioni tempistiche anno ' + d.x,
                callback: function () {
                    cd.openOccupazioneTempisticheAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);
    });
};

cd.openDisoccupazioneStoricoGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico disoccupazione a barre',
            callback: cd.openDisoccupazioneStoricoHistogramGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.lineChartData.drawLineChart('data/disoccupazione.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico disoccupazione a barre',
                callback: cd.openDisoccupazioneStoricoHistogramGraph
            },
            {
                text: 'Informazioni disoccupazione anno ' + d.x,
                callback: function (a) {
                    cd.openDisoccupazioneAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);

    });
};

cd.openDisoccupazioneStoricoHistogramGraph = function () {

    cd.changeInfoControl([
        {
            text: 'Informazioni storico disoccupazione a linee',
            callback: cd.openDisoccupazioneStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.histogramChartData.drawHistogramChart('data/disoccupazione.csv', function (d) {

        var rows = [
            {
                text: 'Informazioni storico disoccupazione a linee',
                callback: cd.openDisoccupazioneStoricoGraph
            },
            {
                text: 'Informazioni disoccupazione anno ' + d.x,
                callback: function (a) {
                    cd.openDisoccupazioneAnnoGraph(d.x);
                }
            },
            {
                text: 'Informazioni storico \"occupati / non\" a linee',
                callback: cd.openOccupazioneNonStoricoGraph
            },
            {
                text: 'Informazioni storico \"occupati / non\" a barre',
                callback: cd.openOccupazioneNonStoricoHistogramGraph
            }
        ];

        cd.changeInfoControl(rows);

    });
};

cd.openOccupazioneNonAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico \"occupati / non\" a linee',
            callback: cd.openOccupazioneNonStoricoGraph
        },
        {
            text: 'Informazioni storico \"occupati / non\" a barre',
            callback: cd.openOccupazioneNonStoricoHistogramGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/occupazione_non.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openDisoccupazioneAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico disoccupazione a linee',
            callback: cd.openDisoccupazioneStoricoGraph
        },
        {
            text: 'Informazioni storico disoccupazione a barre',
            callback: cd.openDisoccupazioneStoricoHistogramGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/disoccupazione.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openOccupazioneFacoltaAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico facoltà a linee',
            callback: cd.openOccupazioneFacoltaStoricoGraph
        },
        {
            text: 'Informazioni storico facoltà a barre',
            callback: cd.openOccupazioneFacoltaStoricoHistogramGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/occupazione_facolta.csv', function (d) {
        cd.changeInfoControl([]);
    });
};

cd.openOccupazioneTempisticheAnnoGraph = function (year) {
    cd.changeInfoControl([
        {
            text: 'Informazioni storico tempistiche a linee',
            callback: cd.openOccupazioneTempisticheStoricoGraph
        },
        {
            text: 'Informazioni storico tempistiche a barre',
            callback: cd.openOccupazioneTempisticheStoricoHistogramGraph
        }
    ]);

    cd.pieChartData.drawPieChart(year, 'data/occupazione_tempistiche.csv', function (d) {
        cd.changeInfoControl([]);
    });
};


cd.openOccupazioneNonStoricoGraph();

// setTimeout(function () {
//     cd.openOccupazioneNonStoricoHistogramGraph();
// }, 2000);