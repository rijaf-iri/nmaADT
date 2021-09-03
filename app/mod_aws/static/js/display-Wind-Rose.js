$(document).ready(() => {
    setAWSWindDataTime(60);
    setAWSWindDataCoords('2');

    $("#windHeight").on("change", () => {
        var height = $("#windHeight option:selected").val();
        setAWSWindDataCoords(height);
    });

    ////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 60);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");

    var data0 = {
        "net_aws": "1_17",
        "height": "2",
        "tstep": "hourly",
        "start": daty1,
        "end": daty2
    };
    plot_WindRose_MinHourly(data0, true);

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
            "net_aws": $("#stationDispAWS option:selected").val(),
            "height": $("#windHeight option:selected").val(),
            "tstep": timestep,
            "start": vrange.start,
            "end": vrange.end
        };
        plot_WindRose_MinHourly(data, false);
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
            net_aws: $("#stationDispAWS option:selected").val(),
            height: $("#windHeight option:selected").val(),
            tstep: timestep,
            start: vrange.start,
            end: vrange.end
        };

        var url = '/openairWindRose' + '?' + encodeQueryData(data);
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
            net_aws: $("#stationDispAWS option:selected").val(),
            height: $("#windHeight option:selected").val(),
            tstep: timestep,
            start: vrange.start,
            end: vrange.end
        };

        var url = '/downWindFreqCSV' + '?' + encodeQueryData(data);
        $("#downTableFreqBut").attr("href", url).attr('target', '_blank');
    });
});

/////////// 
function plot_WindRose_MinHourly(data) {
    $.ajax({
        dataType: "json",
        url: '/chartWindRose',
        data: data,
        timeout: 120000,
        success: highcharts_WindRose_MinHourly,
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

function highcharts_WindRose_MinHourly(json) {
    if (json.status != 'ok') {
        $('#errorMSG').css("background-color", "orange").html(json.status);
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
    var colHeader = Object.keys(json.freq);
    var colNb = colHeader.length;
    var rowNb = json.freq[colHeader[0]].length;
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
            var col = $('<td>').addClass(colclass).text(json.freq[colHeader[j]][i]);
            row.append(col);
        }
        table.append(row);
    }
    $('#idTable').append(table);

    //add title
    var chartP = "Windrose at " + json.height + "m : ";
    var tableP = "Table of Frequencies (%) at " + json.height + "m : ";
    var stnRose = json.name + " - " + json.id + " - " + json.network + "; ";
    var stnPeriod = "Period: " + json.start + " - " + json.end + "; ";
    var stnStep = (json.timestep == "hourly") ? "Hourly" : " 15 minutes";
    stnStep = stnStep + " wind data";

    $('#pwindrose').html(chartP + stnRose + stnPeriod + stnStep);
    $('#pwindfreq').html(tableP + stnRose + stnPeriod + stnStep);

    // click tab dispfreq first to render the table
    // then activate tab disprose
    $('a[href="#dispfreq"]').click();
    $('a[href="#disprose"]').click();
    //
    Highcharts.chart('contWindRose', options);
}