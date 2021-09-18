$(document).ready(() => {
    setAWSAggrDataTime();

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;

        var tstep = $("#timestepDispTS option:selected").val();
        AWS_dataAggrVarObj = (tstep == "hourly") ? AWS_dataHourVarObj : AWS_dataDayVarObj;

        if (AWS_dataAggrVarObj == undefined) {
            setTimeout(() => {
                setAWSAggrTsVariable();
            }, 1000);
        } else {
            setAWSAggrTsVariable();
        }
    });

    ////////////

    $("#timestepDispTS").on("change", () => {
        var tstep = $("#timestepDispTS option:selected").val();
        AWS_dataAggrVarObj = (tstep == "hourly") ? AWS_dataHourVarObj : AWS_dataDayVarObj;

        var aws = $("#stationDispAWS option:selected").val();
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect1();

        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(var_height);

        // spatial
        setAWSAggrSpVariable();
    });

    ////////////

    $("#stationDispAWS").on("change", () => {
        var aws = $("#stationDispAWS option:selected").val();
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect1();

        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(var_height);
    });

    ////////////

    $("#awsObsVar").on("change", () => {
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(var_height);
    });
    $("#awsObsVar").trigger("change");

    ////////////

    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd");
    today.setDate(today.getDate() - 30);
    var daty1 = dateFormat(today, "yyyy-mm-dd");

    var data0 = {
        "net_aws": "2_SHADDI15",
        "var_hgt": "5_1",
        "pars": "Tot",
        "tstep": "daily",
        "start": daty1,
        "end": daty2,
        "plotrange": 0
    };
    plot_TS_dataAggrAWS(data0);

    //
    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var tstep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(tstep, obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;
        //
        var data = {
            "net_aws": $("#stationDispAWS option:selected").val(),
            "var_hgt": $("#awsObsVar option:selected").val(),
            "pars": $("#awsParams option:selected").val(),
            "tstep": tstep,
            "start": vrange.start,
            "end": vrange.end,
            "plotrange": plotrange
        };
        plot_TS_dataAggrAWS(data);
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plot_Map_dataAggrAWS(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plot_Map_dataAggrAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plot_Map_dataAggrAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plot_Map_dataAggrAWS(daty);
    });

    ////////////

    if (AWS_dataAggrVarObj == undefined) {
        setTimeout(() => {
            setAWSAggrSpVariable();
        }, 3000);
    } else {
        setAWSAggrSpVariable();
    }

    ////////////

    $("#awsSpVar").on("change", () => {
        var vars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        leaflet_Map_dataAggrAWS(vars, json);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var json = AWS_DATA;
        var key_title;
        var key_col;
        if (json.status != "ok") {
            var key_draw = false;
            var filename = "aggregated_data";
        } else {
            var key_draw = true;
            var pars = $("#awsSpVar option:selected").val();
            var vkey = getVarNameColorKey(pars);

            var var_sp = pars.split('_');
            var pars1 = var_sp[0] + "_" + var_sp[1];
            var ix = AWS_dataAggrVarObj.map(x => x.var_code + '_' + x.height).indexOf(pars1);
            key_title = AWS_dataAggrVarObj[ix].var_name + ' (' + AWS_dataAggrVarObj[ix].var_units + ')';
            file_name = AWS_dataAggrVarObj[ix].var_name + '_' + AWS_dataAggrVarObj[ix].height + 'm_' + var_sp[2];

            key_col = json.key[vkey];

            var tstep = $("#timestepDispTS option:selected").val();
            var daty = getDateTimeMapData();
            var filename = file_name + "_" + tstep + "_" + daty;
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

//////////

function plot_TS_dataAggrAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartAggrAWSData',
        data: data,
        timeout: 120000,
        success: (json) => {
            highcharts_TS_dataAggrAWS(json);
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

////

function plot_Map_dataAggrAWS(daty) {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/mapAggrAWSData',
        data: data,
        success: (json) => {
            AWS_DATA = json;
            var vars = $("#awsSpVar option:selected").val();
            leaflet_Map_dataAggrAWS(vars, json);
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

//////////

function highcharts_TS_dataAggrAWS(json) {
    if (json.opts.status != "plot") {
        $('#errorMSG').css("background-color", "orange").html(json.opts.status);
        return false;
    }
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