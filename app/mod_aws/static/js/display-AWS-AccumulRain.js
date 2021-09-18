$(document).ready(() => {
    setAWSAccumulRainTime();
    ////////////

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;

        $('#stationDispAWS').attr('enabled', 'true');
        $.each(AWS_JSON, function() {
            var text = this.name + " - " + this.id + " - " + this.network;
            var val = this.network_code + "_" + this.id;
            $('#stationDispAWS').append(
                $("<option>").text(text).val(val)
            );
        });

        $('#stationDispAWS option[value=2_SHADDI15]').attr('selected', true);
        AWS_INFO = getAWSInfos('2_SHADDI15');
    });

    ////////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 90);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");

    var data0 = {
        "net_aws": "2_SHADDI15",
        "accumul": "1",
        "tstep": "hourly",
        "start": daty1,
        "end": daty2
    };
    plot_TS_RainAccumulAWS(data0);

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
        //
        var data = {
            "net_aws": $("#stationDispAWS option:selected").val(),
            "accumul": $("#accumulTime").val(),
            "tstep": tstep,
            "start": vrange.start,
            "end": vrange.end
        };
        plot_TS_RainAccumulAWS(data);
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plot_Map_RainAccumulAWS(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plot_Map_RainAccumulAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plot_Map_RainAccumulAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plot_Map_RainAccumulAWS(daty);
    });
    // 

    $("#downLeafletMap").on("click", () => {
        var json = AWS_DATA;
        var key_title;
        var key_col;
        if (json.status == "no-data") {
            var key_draw = false;
            var filename = "rain_accumulation";
        } else {
            var key_draw = true;
            key_title = 'Rainfall Accumulation (mm)';
            key_col = json.key;

            var tstep = $("#timestepDispTS option:selected").text();
            var accumul = $("#accumulTime").val();
            var daty = getDateTimeMapData();
            var filename = "rain_accumul_" + accumul + "-" + tstep + "_" + daty;
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

//////////

function plot_TS_RainAccumulAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartRainAccumul',
        data: data,
        timeout: 120000,
        success: (json) => {
            highcharts_TS_RainAccumul(json);
            $('#errorMSG').empty();
        },
        beforeSend: () => {
            $("#plotAWSGraph .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render,<br>select a shorter time range <br> or refresh your web browser");
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

function plot_Map_RainAccumulAWS(daty) {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "accumul": $("#accumulTime").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/mapRainAccumul',
        data: data,
        success: (json) => {
            AWS_DATA = json;
            leaflet_Map_RainAccumul(json);
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