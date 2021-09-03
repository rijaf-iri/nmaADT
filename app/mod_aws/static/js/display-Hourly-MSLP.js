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
    plot_Map_HourlyMSLP(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = formatDateMap1Hour();
        plot_Map_HourlyMSLP(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = formatDateMap1Hour();
        plot_Map_HourlyMSLP(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = formatDateMap1Hour();
        plot_Map_HourlyMSLP(daty);
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

function plot_Map_HourlyMSLP(daty) {
    var data = {
        "time": daty
    };
    // 
    $.ajax({
        url: '/mapHourlyMSLP',
        data: data,
        dataType: "json",
        success: (json) => {
            AWS_DATA = json;
            leaflet_Map_HourlyMSLP(json);
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