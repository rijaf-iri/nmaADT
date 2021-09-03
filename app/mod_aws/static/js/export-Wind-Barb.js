EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

////////

$("#downWindDataBut").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var timestep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(timestep, obj);
    var data = {
        net_aws: $("#stationDispAWS option:selected").val(),
        height: $("#windHeight option:selected").val(),
        tstep: timestep,
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downWindBarbCSV' + '?' + encodeQueryData(data);
    $("#downWindDataBut").attr("href", url).attr('target', '_blank');
});