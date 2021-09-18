$(document).ready(() => {
    setAWSWindDataTime(5);
    setAWSWindDataCoords('2');

    $("#windHeight").on("change", () => {
        var height = $("#windHeight option:selected").val();
        setAWSWindDataCoords(height);
    });

    ////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 5);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");
    var data0 = {
        "net_aws": "1_17",
        "height": "2",
        "tstep": "hourly",
        "start": daty1,
        "end": daty2
    };
    plot_WindBarb_MinHourly(data0);

    //
    $("#plotWindDataBut").on("click", () => {
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
        plot_WindBarb_MinHourly(data);
    });
});

/////////// 

function plot_WindBarb_MinHourly(data) {
    $.ajax({
        dataType: "json",
        url: "/chartWindBarb",
        data: data,
        timeout: 120000,
        success: (json) => {
            highcharts_WindBarb_MinHourly(json);
            $('#errorMSG').empty();
        },
        beforeSend: () => {
            $("#plotWindDataBut .glyphicon-refresh").show();
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
        $("#plotWindDataBut .glyphicon-refresh").hide();
    });
}

/////////// 

function highcharts_WindBarb_MinHourly(json) {
    if (json.status != 'ok') {
        $('#errorMSG').css("background-color", "orange").html(json.status);
        return false;
    }
    //
    var options = {
        title: {
            text: json.title,
            style: {
                fontSize: '14px'
            }
        },
        subtitle: {
            text: 'Click and drag in the plot area to zoom in',
            style: {
                fontSize: '9px'
            }
        },
        yAxis: {
            title: {
                text: 'Wind speed (m/s)'
            }
        },
        xAxis: {
            type: 'datetime',
            offset: 50
        },
        chart: {
            zoomType: 'x',
            events: {
                load: function() {
                    var chart = this,
                        series = this.series[0],
                        xAxis = chart.xAxis[0],
                        newStart = series.xData[json.data.length - 100],
                        newEnd = series.xData[json.data.length];

                    xAxis.setExtremes(newStart, newEnd);
                    this.showResetZoom();
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        },
        series: [{
            type: 'windbarb',
            keys: ['x', 'value', 'direction'],
            data: json.data,
            name: 'Wind',
            lineWidth: 1.5,
            vectorLength: 15,
            color: Highcharts.getOptions().colors[1],
            showInLegend: false,
            tooltip: {
                valueSuffix: ' m/s',
                xDateFormat: '%Y-%m-%d %H:%M',
                valueDecimals: 1
            }
        }, {
            // type: 'area',
            keys: ['x', 'y', 'direction'], // direction is not used here
            data: json.data,
            showInLegend: false,
            color: 'rgba(102, 37, 6, 1)',
            // fillColor: {
            //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            //     stops: [
            //         [0, 'rgba(102, 37, 6, 0.99)'],
            //         [1, 'rgba(255, 255, 229, 0.1)']
            //     ]
            // },
            name: 'Wind speed',
            tooltip: {
                valueSuffix: ' m/s',
                xDateFormat: '%Y-%m-%d %H:%M',
                valueDecimals: 1
            },
            states: {
                inactive: {
                    opacity: 1
                }
            }
        }]
    };
    // 
    var exporting = {
        enabled: true,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        }
    };

    options.exporting = exporting;
    // 
    Highcharts.chart('contAWSGraph', options);

    return true;
}