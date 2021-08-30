$(document).ready(() => {
    var timestep = $('<select>')
        .attr("id", "timestepDispTS")
        .css("display", "none")
        .appendTo('body');
    timestep.append(
        $("<option>").val("daily")
    );

    setQCOutputTime();

    /////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapAWSQCOutput(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    // 

    $("#downLeafletMap").on("click", () => {
        var daty = getDateTimeMapData();
        var filename = "QC_Outputs_Daily_" + daty;
        var printer = easyPrintMap();
        printer.printMap('CurrentSize', filename);
        setTimeout(() => {
            mymapBE.removeControl(printer);
        }, 1000);
    });
});

//////////

function plotMapAWSQCOutput(daty) {
    $.ajax({
        url: '/displayQCDaily',
        data: { "date": daty },
        dataType: "json",
        success: leafletMapQCoutput,
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}