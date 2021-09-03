EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

////////////

var today = new Date();
var daty2 = dateFormat(today, "yyyy-mm-dd");
today.setDate(today.getDate() - 30);
var daty1 = dateFormat(today, "yyyy-mm-dd");

var data0 = {
    "net_aws": ["2_SHADDI15"],
    "var_hgt": "5_1",
    "pars": "Tot",
    "tstep": "daily",
    "range": {
        "start": daty1,
        "end": daty2
    }
};

dispSel_Table_dataAggrAWS(data0);
$('#pTable').html("Precipitation - Total");

//
$("#dispAWSTable").on("click", () => {
    $('a[href="#disptable"]').click();
    //
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    //

    var data = {
        "net_aws": selAWSTS,
        "var_hgt": $("#awsObsVar option:selected").val(),
        "pars": $("#awsParams option:selected").val(),
        "tstep": tstep,
        "range": vrange
    };

    dispSel_Table_dataAggrAWS(data);
});

////////////

function dispSel_Table_dataAggrAWS(data) {
    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: "application/json",
        url: '/tableAggrAWSDataSel',
        dataType: "json",
        timeout: 120000,
        success: (json) => {
            $('.jsonTable').remove();
            $('#pTable').html(json.title);

            //
            var colHeader = json.order;
            var colNb = colHeader.length;
            var rowNb = json.data.length;
            //
            var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
            var rowh = $('<tr>');
            for (var i = 0; i < colNb; i++) {
                var col = $('<th>').text(colHeader[i]);
                rowh.append(col);
            }
            table.append(rowh);
            for (var i = 0; i < rowNb; i++) {
                var row = $('<tr>');
                for (var j = 0; j < colNb; j++) {
                    var col = $('<td>').text(json.data[i][colHeader[j]]);
                    row.append(col);
                }
                table.append(row);
            }
            //
            $('#idTable').append(table);
        },
        beforeSend: () => {
            $("#dispAWSTable .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render, select a shorter time range or refresh your web browser");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(() => {
        $("#dispAWSTable .glyphicon-refresh").hide();
    });
}

////////////

$("#downAWSVars").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);

    var data = {
        "net_aws": selAWSTS,
        "var_hgt": $("#awsObsVar option:selected").val(),
        "pars": $("#awsParams option:selected").val(),
        "tstep": tstep,
        "range": vrange
    };

    $.ajax({
        type: 'POST',
        data: JSON.stringify(data),
        contentType: "application/json",
        url: '/downTableAggrDataSelCSV',
        xhrFields: {
            responseType: 'blob'
        },
        success: (blob, status, xhr) => {
            // default filename if not found
            var filename = data["tstep"] + "_" + data["var_hgt"] + "_" + data["pars"] + ".csv"

            // check for a filename
            var dispos = xhr.getResponseHeader('Content-Disposition');
            if (dispos && dispos.indexOf('attachment') !== -1) {
                var pregex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = pregex.exec(dispos);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            // create downloadable link
            var downlink = document.createElement("a");
            downlink.href = downloadUrl;
            downlink.download = filename;
            document.body.appendChild(downlink);
            downlink.click();

            // cleanup
            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 100);
        }
    });
});