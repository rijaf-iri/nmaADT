$(document).ready(() => {
    setAWSAccumulRainTime();
    ////////////

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;
        $('#stationDispAWS').attr('enabled', 'true');
        $.each(AWS_JSON, function() {
            var text = this.id + " - " + this.stationName + " - " + this.AWSGroup;
            var val = this.id;
            $('#stationDispAWS').append(
                $("<option>").text(text).val(val)
            );
        });
        $('#stationDispAWS option[value=000003]').attr('selected', true);
        AWS_INFO = getAWSInfos('000003');
    });

    ////////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 90);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");

    var data0 = {
        "aws": "000003",
        "tstep": "hourly",
        "accumul": "1",
        "start": daty1,
        "end": daty2
    };
    plotRainAccumulAWS(data0);

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
            "aws": $("#stationDispAWS option:selected").val(),
            "tstep": tstep,
            "accumul": $("#accumulTime").val(),
            "start": vrange.start,
            "end": vrange.end
        };
        plotRainAccumulAWS(data);
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapRainAccumulAWS(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
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

function plotRainAccumulAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartRainAccumulAWS',
        data: data,
        timeout: 120000,
        success: highchartsRainAccumulAWS,
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

function plotMapRainAccumulAWS(daty) {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "accumul": $("#accumulTime").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/displayMAPRainAccumul',
        data: data,
        success: (json) => {
            leafletMapRainAccumulAWS(json);
            AWS_DATA = json;
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}