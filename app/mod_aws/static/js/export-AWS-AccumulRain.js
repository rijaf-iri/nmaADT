EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

////////////

$("#downAWSAccumTS").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);

    var data = {
        aws: $("#stationDispAWS option:selected").val(),
        accumul: $("#accumulTime").val(),
        tstep: tstep,
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downRainAccumulTS' + '?' + encodeQueryData(data);
    $("#downAWSAccumTS").attr("href", url).attr('target', '_blank');
});

////////////

$("#downAWSAccumSP").on("click", () => {
    var data = {
        tstep: $("#timestepDispTS option:selected").val(),
        accumul: $("#accumulTime").val(),
        time: getDateTimeMapData()
    };
    var url = '/downRainAccumulSP' + '?' + encodeQueryData(data);

    $("#downAWSAccumSP").attr("href", url).attr('target', '_blank');
});