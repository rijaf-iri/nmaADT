$(document).ready(() => {
    var timestep = $('<select>')
        .attr("id", "timestepDispTS")
        .css("display", "none")
        .appendTo('body');
    timestep.append(
        $("<option>").val("hourly")
    );

    setAWSHourlyMSLPTime();

    ////////////
    // Initialize map
    var daty0 = formatDateMap1Hour();
    plotMapHourlyMSLP(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = formatDateMap1Hour();
        plotMapHourlyMSLP(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = formatDateMap1Hour();
        plotMapHourlyMSLP(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = formatDateMap1Hour();
        plotMapHourlyMSLP(daty);
    });
    // 

    $("#downLeafletMap").on("click", () => {
        var json = AWS_DATA;
        var key_title;
        var key_col;
        if (json.status == "no-data") {
            var key_draw = false;
            var filename = "mslp";
        } else {
            var key_draw = true;
            key_title = 'Mean Sea Level Pressure (hPa)';
            key_col = json.key;

            var daty = formatDateMap1Hour();
            var filename = "mslp_" + daty;
        }

        saveLeafletDispAWS(key_draw, key_col, key_title, filename);
    });
});

//////////

function plotMapHourlyMSLP(daty) {
    var data = {
        "time": daty
    };
    // 
    $.ajax({
        url: '/dispMapMSLPHourly',
        data: data,
        dataType: "json",
        success: (json) => {
            leafletMapMSLP(json);
            AWS_DATA = json;
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}