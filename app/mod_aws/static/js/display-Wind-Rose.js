$(document).ready(() => {
    setAWSWindDataTime(60);

    ////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 60);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");

    var data0 = {
        "aws": "000003",
        "tstep": "hourly",
        "start": daty1,
        "end": daty2
    };
    plotWindRose10MinHourly(data0);

    //
    $("#plotWindroseBut").on("click", () => {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        //
        var data = {
            "aws": $("#stationDispAWS option:selected").val(),
            "tstep": timestep,
            "start": vrange.start,
            "end": vrange.end
        };
        plotWindRose10MinHourly(data);
    });

    /////////
    $("#downWindroseBut").on("click", () => {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var data = {
            tstep: timestep,
            aws: $("#stationDispAWS option:selected").val(),
            start: vrange.start,
            end: vrange.end
        };

        var url = '/openairWindrose' + '?' + encodeQueryData(data);
        $("#downWindroseBut").attr("href", url).attr('target', '_blank');
    });

    ////////
    $("#downTableFreqBut").on("click", () => {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var data = {
            tstep: timestep,
            aws: $("#stationDispAWS option:selected").val(),
            start: vrange.start,
            end: vrange.end
        };

        var url = '/donwWindFreqCSV' + '?' + encodeQueryData(data);
        $("#downTableFreqBut").attr("href", url).attr('target', '_blank');
    });
});

/////////// 
function plotWindRose10MinHourly(data) {
    $.ajax({
        dataType: "json",
        url: '/dispWindRose',
        data: data,
        timeout: 120000,
        success: (json) => {
            var ret = highchartsWindRose10MinHourly(json);
            if (ret) {
                titleWindRose10MinHourly();
            }
        },
        beforeSend: () => {
            $("#plotWindroseBut .glyphicon-refresh").show();
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
        $("#plotWindroseBut .glyphicon-refresh").hide();
    });
}

/////////// 

function titleWindRose10MinHourly() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    // 
    var timestep = $("#timestepDispTS option:selected").val();
    var aws = $("#stationDispAWS option:selected").val();
    var vrange = startEndDateTime(timestep, obj);
    //
    var stn = new Object();
    for (var i = 0; i < AWS_JSON.length; ++i) {
        if (AWS_JSON[i].id === aws) {
            stn['id'] = AWS_JSON[i].id;
            stn['name'] = AWS_JSON[i].stationName;
            stn['step'] = AWS_JSON[i].timestep;
        }
    }
    //
    stnStart = vrange.start.split("-");
    var min1 = (timestep == "hourly") ? "00" : stnStart[4];
    stnStart = stnStart[0] + "/" + stnStart[1] + "/" + stnStart[2] + " " + stnStart[3] + ":" + min1;
    stnEnd = vrange.end.split("-");
    var min2 = (timestep == "hourly") ? "00" : stnEnd[4];
    stnEnd = stnEnd[0] + "/" + stnEnd[1] + "/" + stnEnd[2] + " " + stnEnd[3] + ":" + min2;
    var stnPeriod = "Period: " + stnStart + " - " + stnEnd + "; ";
    //
    var stnStep = (timestep == "hourly") ? "Hourly" : stn.step + " minutes";
    stnStep = stnStep + " wind data";
    //
    var stnRose = "Windrose: " + stn.id + " - " + stn.name + "; ";
    $('#pwindrose').html(stnRose + stnPeriod + stnStep);
    var stnFreq = "Table of Frequencies (%): " + stn.id + " - " + stn.name + "; ";
    $('#pwindfreq').html(stnFreq + stnPeriod + stnStep);
}

/////////// 

function highchartsWindRose10MinHourly(json) {
    if (jQuery.isEmptyObject(json)) {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }
    // 
    var downData = ['separator', 'downloadCSV', 'downloadXLS'];
    chartButtonMenuItems = chartButtonMenuItems.concat(downData);
    // 
    var options = {
        data: {
            table: 'jsonTable',
            startRow: 0,
            endRow: 16,
            endColumn: 7
        },
        chart: {
            polar: true,
            type: 'column'
        },
        title: {
            text: null
        },
        pane: {
            size: '80%'
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 100,
            layout: 'vertical'
        },
        xAxis: {
            tickmarkPlacement: 'on'
        },
        yAxis: {
            min: 0,
            endOnTick: false,
            showLastLabel: true,
            title: {
                text: 'Frequency (%)'
            },
            labels: {
                formatter: function() {
                    return this.value + '%';
                }
            },
            reversedStacks: false
        },
        tooltip: {
            valueSuffix: '%'
        },
        colors: ["darkblue", "blue", "green", "greenyellow", "orange", "red", "darkred"],
        plotOptions: {
            series: {
                stacking: 'normal',
                shadow: false,
                groupPadding: 0,
                pointPlacement: 'on'
            }
        },
        exporting: {
            enabled: true,
            filename: "windrose",
            buttons: {
                contextButton: {
                    menuItems: chartButtonMenuItems
                }
            }
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        }
    };
    //////
    // remove table first if exist
    $('.jsonTable').remove();

    // 
    var colHeader = Object.keys(json);
    var colNb = colHeader.length;
    var rowNb = json[colHeader[0]].length;
    //
    var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
    var rowh = $('<tr>');
    for (var i = 0; i < colNb; i++) {
        var col = $('<th>').addClass("freq").text(colHeader[i]);
        rowh.append(col);
    }
    table.append(rowh);
    for (var i = 0; i < rowNb; i++) {
        var row = $('<tr>');
        for (var j = 0; j < colNb; j++) {
            var colclass;
            if (i < 16) {
                colclass = ((j == 0) ? "dir" : "data");
            } else if (i == 16) {
                colclass = "totals";
            } else {
                colclass = "calm";
            }
            var col = $('<td>').addClass(colclass).text(json[colHeader[j]][i]);
            row.append(col);
        }
        table.append(row);
    }
    $('#idTable').append(table);

    // click tab dispfreq first to render the table
    // then activate tab disprose
    $('a[href="#dispfreq"]').click();
    $('a[href="#disprose"]').click();
    //
    Highcharts.chart('contWindRose', options);

    return true;
}