function setLogFilesTime() {
    var label = ['Year', 'Mon', 'Day'];
    var pname = ['year', 'month', 'day'];
    // 
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    $('#minute3', '#hour3', '#pentad3', '#dekad3').hide();

    //
    var timestep = $("#timestepDispTS option:selected").val();
    var daty = new Date();

    if (timestep == "daily") {
        daty.setDate(daty.getDate() - 1);
    }

    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 2020; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
}

/////////////

function LogFilesTimediv(text) {
    var div = $('<div>');
    $('<label>')
        .addClass('control-label')
        .text(text)
        .appendTo(div);
    div.append('<br>')
    $('<table>')
        .addClass('aws-select-time map-select-time')
        .appendTo(div);

    $("#logFilesSelect").append(div);
}

/////////////

function LogFilesAWSNetwork() {
    var div = $('<div>');
    $('<label>')
        .addClass('control-label')
        .text("Select AWS Network")
        .appendTo(div);

    var awsnet = $('<select>')
        .addClass('form-control')
        .attr('id', 'awsnetwork')
        .appendTo(div);

    var awsnet_val = ["REMA", "LSI-XLOG", "LSI-ELOG"];
    for (var i = 0; i < 3; ++i) {
        awsnet.append($("<option>")
            .val(awsnet_val[i])
            .text(awsnet_val[i]));
    }
    awsnet.val("LSI-XLOG");

    $("#logFilesSelect").append(div);
}

/////////////

function LogFilesButtonNav() {
    var div = $('<div>').attr('id', 'butMapVar');
    var table = $('<table>');
    var tr = $('<tr>');

    var td1 = $('<td>');
    var a1 = $('<a>').attr('id', 'AWSMapPrev');
    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Previous'
    }).appendTo(a1);
    td1.append(a1);

    var td2 = $('<td>');
    var a2 = $('<a>').attr('id', 'AWSMapDis');
    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Display'
    }).appendTo(a2);
    td2.append(a2);

    var td3 = $('<td>');
    var a3 = $('<a>').attr('id', 'AWSMapNext');
    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Next'
    }).appendTo(a3);
    td3.append(a3);

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    table.append(tr);
    div.append(table);

    $("#logFilesSelect").append(div);
}

/////////////

function LogFilesDownMap() {
    var div = $('<div>').addClass('download');
    $("<button>", {
        'id': 'downLeafletMap',
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Download Map'
    }).appendTo(div);

    $("#logFilesSelect").append(div);
}

/////////////

function LogFilesDownMap() {
    var div = $('<div>').addClass('download');
    $("<button>", {
        'id': 'downLeafletMap',
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Download Map'
    }).appendTo(div);

    $("#logFilesSelect").append(div);
}

/////////////

function LogFilesDispUp() {
    var div = $('<div>');
    var a = $('<a>').attr('id', 'AWSMapDis');
    $("<button>", {
        type: 'button',
        'class': 'btn btn-primary btn-block',
        text: 'Display'
    }).appendTo(a);
    div.append(a);

    $("#logFilesSelect").append(div);
}

/////////////