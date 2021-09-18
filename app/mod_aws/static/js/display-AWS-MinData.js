$(document).ready(() => {
    setAWSMinDataTime();

    //
    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;
        $('#stationDispAWS').attr('enabled', 'true');
        $.each(json, function() {
            var text = this.name + " - " + this.id + " - " + this.network;
            var val = this.network_code + "_" + this.id;
            $('#stationDispAWS').append(
                $("<option>").text(text).val(val)
            );
        });
        // Initialization
        $('#stationDispAWS option[value=2_SHADDI15]').attr('selected', true);
        AWS_INFO = getAWSInfos('2_SHADDI15');
        setAWSVariableSelect('2_SHADDI15');

        // Integrate to R function from /readCoords
        AWS_TimeRange = getAWSTimeRange('/getAWSTimeRange', {
            'id': "SHADDI15",
            'net': '2'
        });

        //
        setAWSParamSelect("5_1");
        displayMetadata();
    });

    //
    $("#stationDispAWS").on("change", () => {
        var aws = $("#stationDispAWS option:selected").val();
        //
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect(aws);
        //
        AWS_TimeRange = getAWSTimeRange('/getAWSTimeRange', {
            'id': aws,
            'net': AWS_INFO.network_code
        });
        // 
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect(var_height);
        displayMetadata();
    });

    //
    $('#arearange').prop('checked', false);
    $('#rangepars').hide();

    $("#stationDispAWS, #awsObsVar").on("change", () => {
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect(var_height);
        //
        $('#arearange').prop('checked', false);
        $('#rangepars').hide();

        var var_hgt = var_height.split("_");
        var stat = AWS_INFO.STATS[var_hgt[0]][var_hgt[1]];
        var vpars = [];
        for (var i = 0; i < stat.length; ++i) {
            vpars[i] = stat[i].name;
        }

        var isMax = $.inArray('max', vpars);
        var isMin = $.inArray('min', vpars);
        var isAvg = $.inArray('avg', vpars);
        if (isMax !== -1 && isMin !== -1 && isAvg !== -1) {
            $('#rangepars').show();
        }
    });

    ///////////////
    // Initialize chart

    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh-MM");
    today.setDate(today.getDate() - 5);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh-MM");

    var data0 = {
        "net_aws": "2_SHADDI15",
        "var_hgt": "5_1",
        "stat": "4",
        "start": daty1,
        "end": daty2,
        "plotrange": 0
    };

    plot_TS_dataMinAWS(data0);

    ///////
    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var vrange = startEndDateTime('minute', obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;

        var data = {
            "net_aws": $("#stationDispAWS option:selected").val(),
            "var_hgt": $("#awsObsVar option:selected").val(),
            "stat": $("#awsParams option:selected").val(),
            "start": vrange.start,
            "end": vrange.end,
            "plotrange": plotrange
        };

        plot_TS_dataMinAWS(data);
    });

    ////////////
    // Initialize map
    var time_min = formatDateMapMin();
    plot_Map_dataMinAWS(time_min);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var time_min = formatDateMapMin();
        plot_Map_dataMinAWS(time_min);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataMin(15);
        var time_min = formatDateMapMin();
        plot_Map_dataMinAWS(time_min);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataMin(-15);
        var time_min = formatDateMapMin();
        plot_Map_dataMinAWS(time_min);
    });

    //////////

    if (AWS_dataMinVarObj == undefined) {
        setTimeout(() => {
            setAWSMinSpVariable();
        }, 1000);
    } else {
        setAWSMinSpVariable();
    }

    /////////

    $("#awsSpVar").on("change", () => {
        var vars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        leaflet_Map_dataMinAWS(vars, json);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var json = AWS_DATA;
        var key_title;
        var key_col;
        if (json.status != "ok") {
            var key_draw = false;
            var filename = "aws_15min_data";
        } else {
            var key_draw = true;
            var pars = $("#awsSpVar option:selected").val();
            var vkey = getVarNameColorKey(pars);

            var ix = AWS_dataMinVarObj.map(x => x.var_code + '_' + x.height + '_' + x.stat_code).indexOf(pars);
            key_title = AWS_dataMinVarObj[ix].var_name + ' (' + AWS_dataMinVarObj[ix].var_units + ')';
            file_name = AWS_dataMinVarObj[ix].var_name + '_' + AWS_dataMinVarObj[ix].height + 'm_' + AWS_dataMinVarObj[ix].stat_name;

            key_col = json.key[vkey];

            var daty = formatDateMapMin();
            var filename = file_name + "_" + daty;
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

//////////

function plot_Map_dataMinAWS(daty) {
    var data = {
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/mapMinAWSData',
        data: data,
        success: (json) => {
            AWS_DATA = json;
            var vars = $("#awsSpVar option:selected").val();
            leaflet_Map_dataMinAWS(vars, json);
            $('#errorMSG').empty();
        },
        beforeSend: () => {
            if (mymapBE != undefined) {
                mymapBE.closePopup();
                mymapBE.spin(true, spinner_opts);
            }
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    }).always(() => {
        mymapBE.spin(false);
    });
}

////

function plot_TS_dataMinAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartMinAWSData',
        data: data,
        timeout: 120000,
        success: (json) => {
            highcharts_TS_dataMinAWS(json);
            $('#errorMSG').empty();
        },
        beforeSend: () => {
            $("#plotAWSGraph .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render, select a shorter time range or refresh your web browser");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(() => {
        $("#plotAWSGraph .glyphicon-refresh").hide();
    });
}

//////////

function highcharts_TS_dataMinAWS(json) {
    if (json.opts.status == "no-data") {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }
    // 
    var options = {
        title: {
            text: json.opts.title
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: null
            },
            opposite: false,
            minorTickInterval: "auto",
            minorGridLineDashStyle: "LongDashDotDot"
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        }
    };
    // 
    if (json.opts.arearange) {
        var tooltip = {
            crosshairs: true,
            shared: true,
            valueDecimals: 1
        };
        var series = [{
            name: json.opts.name[1],
            keys: ['x', 'low', 'high', 'y'],
            data: json.data,
            zIndex: 1,
            fillColor: 'lightblue',
            lineWidth: 1.5,
            lineColor: 'blue'
        }, {
            name: json.opts.name[0],
            keys: ['x', 'low', 'high', 'Ave'],
            data: json.data,
            type: 'arearange',
            linkedTo: ':previous',
            lineWidth: 1,
            lineColor: 'red',
            color: 'pink',
            fillOpacity: 0.2,
            zIndex: 0,
            marker: {
                enabled: false
            }
        }];
        options.tooltip = tooltip;
    } else {
        var rangeSelector = {
            selected: 1
        };
        var series = [{
            name: json.opts.name,
            data: json.data,
            type: (json.var == "5" ? "column" : "line"),
            lineWidth: 1,
            color: "blue",
            tooltip: {
                crosshairs: false,
                valueDecimals: 1
            }
        }];

        options.rangeSelector = rangeSelector;
    }
    // 
    var exporting = {
        enabled: true,
        filename: json.opts.filename,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        }
    };

    // 
    options.exporting = exporting;
    options.series = series;

    Highcharts.stockChart('contAWSGraph', options);
}