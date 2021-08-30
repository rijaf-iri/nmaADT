$(document).ready(() => {
    setAWSWindDataTime(60);

    ////////
    var today = new Date();
    var daty2 = dateFormat(today, "yyyy-mm-dd-hh");
    today.setDate(today.getDate() - 60);
    var daty1 = dateFormat(today, "yyyy-mm-dd-hh");
    var data0 = {
        tstep: 'hourly',
        aws: '000003',
        start: daty1,
        end: daty2,
        centre: 'S'
    };
    var url0 = '/dispWindContours' + '?' + encodeQueryData(data0);
    $("#windcontours").attr("src", url0);

    //
    $("#plotWindDataBut").on("click", () => {
        $("#plotWindDataBut .glyphicon-refresh").show();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var data = {
            tstep: timestep,
            aws: $("#stationDispAWS option:selected").val(),
            start: vrange.start,
            end: vrange.end,
            centre: $("#mapcentre option:selected").val()
        };
        var url = '/dispWindContours' + '?' + encodeQueryData(data);
        $("#windcontours")
            .on('load', () => {
                $("#plotWindDataBut .glyphicon-refresh").hide();
            })
            .on('error', () => {
                $('#errorMSG').css("background-color", "red")
                    .html("Unable to load image");
                $("#plotWindDataBut .glyphicon-refresh").hide();
            }).attr("src", url);
    });
});