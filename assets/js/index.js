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

cd.pieChartData.drawPieChart = function (year) {
    // var svg = d3.select("svg"),
    //     width = +svg.attr("width"),
    //     height = +svg.attr("height"),
    var radius = Math.min(cd.width, cd.height) / 2;
    //     g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scale.ordinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.valore;
        });

    var path = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(0);

    var label = d3.svg.arc()
        .outerRadius(radius - 80)
        .innerRadius(radius - 40);

    d3.csv("test/pie_chart/CSV_file.csv", function (d) {
        d.valore = +d.valore;
        return d;
    }, function (error, data) {
        if (error) throw error;

        cd.chartContainer.html("");

        var svg = cd.chartContainer
            .append("svg")
            .attr("width", cd.width + cd.margin.left + cd.margin.right)
            .attr("height", cd.height + cd.margin.top + cd.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + cd.margin.left + "," + cd.margin.top + ")");

        var arc = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                console.log(d);
                return color(d.data.nome);
            });

        arc.append("text")
            .attr("transform", function (d) {
                return "translate(" + label.centroid(d) + ")";
            })
            .attr("dy", "0.35em")
            .text(function (d) {
                return d.data.nome;
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
    cd.pieChartData.drawPieChart(year);
};

cd.openOccupazioneNonStoricoGraph();

// setTimeout(function () {
//     cd.openOccupazioneFacoltaStoricoGraph();
// }, 2000);