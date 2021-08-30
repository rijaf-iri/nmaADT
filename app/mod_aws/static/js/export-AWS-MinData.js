EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);
//
$("#downAWSVar").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var vrange = startEndDateTime('minute', obj);

    var data = {
        var_hgt: $("#awsObsVar option:selected").val(),
        net_aws: $("#stationDispAWS option:selected").val(),
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downAWSMinDataCSV' + '?' + encodeQueryData(data);
    $("#downAWSVar").attr("href", url).attr('target', '_blank');
});