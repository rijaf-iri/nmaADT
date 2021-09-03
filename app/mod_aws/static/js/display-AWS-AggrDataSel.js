$(document).ready(() => {
    setAWSAggrDataTime();

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;

        var tstep = $("#timestepDispTS option:selected").val();
        AWS_dataAggrVarObj = (tstep == "hourly") ? AWS_dataHourVarObj : AWS_dataDayVarObj;

        if (AWS_dataAggrVarObj == undefined) {
            setTimeout(() => {
                setAWSAggrTsVariableSel();
            }, 1000);
        } else {
            setAWSAggrTsVariableSel();
        }
    });

    ////////////

    // var oldVAR = $("#awsObsVar option:selected").val();

    $("#selectAWSPlotTS").on("click", () => {
        $('#selectAWSModalTS').empty();
        var var_height = $("#awsObsVar option:selected").val();
        var v_h = var_height.split("_");

        var json = AWS_JSON.map((x) => {
            var pr = x.PARS;
            if (pr.includes(Number(v_h[0])) &&
                Object.keys(x.height[v_h[0]][0]).includes(v_h[1])
            ) {
                return x;
            }
        });

        var awsjson = json.filter(x => x !== undefined);
        var divmodal = selectAWS2DispTS(awsjson, selAWSTS);

        $('#selectAWSModalTS').append(divmodal);
        $('#selectAWSModalTS').modal('show');
    });

    ////////////

    $("#awsObsVar").on("change", () => {
        var var_height = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(var_height);
        // 
        // if (oldVAR !== var_height) {
        //     selAWSTS = [];
        // }
    });
    $("#awsObsVar").trigger("change");

    ////////////

    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd");
    today.setDate(today.getDate() - 30);
    var daty1 = dateFormat(today, "yyyy-mm-dd");

    var data0 = {
        "net_aws": ["2_SHADDI15"],
        "var_hgt": "5_1",
        "pars": "Tot",
        "tstep": "daily",
        "range": {
            "start": daty1,
            "end": daty2
        }
    };
    plotSel_TS_dataAggrAWS(data0);

    //
    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        // 
        if (selAWSTS.length == 0) {
            $('#errorMSG').css("background-color", "orange");
            $('#errorMSG').html("No stations selected");
            return false;
        }

        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var tstep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(tstep, obj);
        //
        var data = {
            "net_aws": selAWSTS,
            "var_hgt": $("#awsObsVar option:selected").val(),
            "pars": $("#awsParams option:selected").val(),
            "tstep": tstep,
            "range": vrange
        };

        plotSel_TS_dataAggrAWS(data);
    });

    ////////////

    $("#selectAWSPlotSP").on("click", () => {
        $('#selectAWSModalSP').empty();
        // vars = var_hgt_par
        var vars = $("#awsSpVar option:selected").val();
        var json = JSON.parse(JSON.stringify(AWS_DATA));
        var divmodal = selectAWS2DispSP(json, selAWSSP, vars);

        $('#selectAWSModalSP').append(divmodal);
        $('#selectAWSModalSP').modal('show');
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotSel_Map_dataAggrAWS(daty0, selAWSSP);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotSel_Map_dataAggrAWS(daty, selAWSSP);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotSel_Map_dataAggrAWS(daty, selAWSSP);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotSel_Map_dataAggrAWS(daty, selAWSSP);
    });

    ////////////

    if (AWS_dataAggrVarObj == undefined) {
        setTimeout(() => {
            setAWSAggrSpVariable();
        }, 1000);
    } else {
        setAWSAggrSpVariable();
    }

    ////////////

    $("#awsSpVar").on("change", () => {
        var vars = $("#awsSpVar option:selected").val();
        var json = JSON.parse(JSON.stringify(AWS_DATA));
        if (selAWSSP.length > 0) {
            json = selectDataAWSSP(json, selAWSSP);
        }
        leaflet_Map_dataAggrAWS(vars, json);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var json = AWS_DATA;
        var key_title;
        var key_col;
        if (json.status != "ok") {
            var key_draw = false;
            filename = "aggregated_data";
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
            filename = file_name + "_" + tstep + "_" + daty;
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

//////////

var selAWSTS = ['2_SHADDI15'];
var selAWSSP = [];

//////////

function plotSel_Map_dataAggrAWS(daty, selaws) {
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

            if (json.status == "no-data") {
                $(".selectAWSSP").hide();
                $('#colKeyMapVar').empty();

                var jsonSP = json;
            } else {
                $(".selectAWSSP").show();

                var jsonSP = JSON.parse(JSON.stringify(json));
                if (selaws.length > 0) {
                    jsonSP = selectDataAWSSP(jsonSP, selaws);
                }
            }
            leaflet_Map_dataAggrAWS(vars, jsonSP);
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

function plotSel_TS_dataAggrAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/chartAggrAWSDataSel',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 120000,
        dataType: "json",
        success: highchartsTSAggrAWS,
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

function highchartsTSAggrAWS(json) {
    if (json.opts.status != "plot") {
        var msg = (json.opts.status == "no-data") ? "No data" : "Unable to connect to the database";
        $('#errorMSG').css("background-color", "orange").html(msg);
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
                lineWidth: 2,
                turboThreshold: 0
            }
        },
        rangeSelector: {
            selected: json.data.length
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            valueDecimals: 1,
            split: true
        }
    };

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
    options.series = json.data;

    Highcharts.stockChart('contAWSGraph', options);
}