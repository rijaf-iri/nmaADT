$(document).ready(() => {
    var timeval = ["daily", "monthly"];
    var timestep = $('<select>')
        .attr("id", "timestepDispTS")
        .css("display", "none")
        .appendTo('body');

    for (var i = 0; i < 2; i++) {
        timestep.append(
            $("<option>").val(timeval[i])
        );
    }

    $("#logType").on("change", () => {
        $("#logFilesSelect").empty();
        $('#contQCTable').empty();

        var logtype = $("#logType option:selected").val();

        switch (logtype) {
            case "logperaws":
                LogFilesTimediv("Select Date");
                $("#timestepDispTS").val("daily");
                setLogFilesTime();
                LogFilesButtonNav();
                LogFilesDownMap();
                break;
            case "logproc":
                //// Monthly
                // LogFilesAWSNetwork();
                // LogFilesTimediv("Select Month");
                // $("#timestepDispTS").val("monthly");
                // setLogFilesTime();
                // $(".aws-select-time td:last-child").hide();
                // LogFilesButtonNav();
                //// Daily
                LogFilesAWSNetwork();
                LogFilesTimediv("Select Date");
                $("#timestepDispTS").val("daily");
                setLogFilesTime();
                LogFilesButtonNav();

                break;
            case "logupload":
                LogFilesAWSNetwork();
                LogFilesDispUp();
        }

        /////////////
        // Initialize map

        if (logtype == "logperaws") {
            var daty0 = getDateTimeMapData();
            dispAWSLogFiles(daty0);
        }

        ////////
        $("#AWSMapDis").on("click", () => {
            var logtype = $("#logType option:selected").val();
            if (logtype == "logperaws") {
                $('a[href="#dispawssp"]').click();
            } else {
                $('a[href="#dispawsqc"]').click();
            }
            //
            if (logtype == "logupload") {
                var daty = null;
            } else {
                var daty = getDateTimeMapData();
            }
            dispAWSLogFiles(daty);
        });

        //
        $("#AWSMapNext").on("click", () => {
            var logtype = $("#logType option:selected").val();
            if (logtype == "logperaws") {
                $('a[href="#dispawssp"]').click();
            } else {
                $('a[href="#dispawsqc"]').click();
            }
            //
            if (logtype == "logupload") {
                var daty = null;
            } else {
                setDateTimeMapData(1);
                var daty = getDateTimeMapData();
            }
            dispAWSLogFiles(daty);
        });
        //
        $("#AWSMapPrev").on("click", () => {
            var logtype = $("#logType option:selected").val();
            if (logtype == "logperaws") {
                $('a[href="#dispawssp"]').click();
            } else {
                $('a[href="#dispawsqc"]').click();
            }
            //
            if (logtype == "logupload") {
                var daty = null;
            } else {
                setDateTimeMapData(-1);
                var daty = getDateTimeMapData();
            }
            dispAWSLogFiles(daty);
        });
        //

        // download leafletmap
        if (logtype == "logperaws") {

        }
    });

    $("#logType").trigger("change");
});

//////////
var LOG_DATA;
//////////

function dispAWSLogFiles(daty) {
    var logtype = $("#logType option:selected").val();
    if (logtype == "logperaws") {
        var awsnet = null;
    } else {
        var awsnet = $("#awsnetwork option:selected").val();
    }

    var data = {
        "date": daty,
        "logtype": logtype,
        "awsnet": awsnet
    }
    // console.log(data)

    $.ajax({
        url: '/displayLogFiles',
        data: data,
        dataType: "json",
        success: (json) => {
            if (logtype == "logperaws") {
                $('a[href="#dispawssp"]').show();
                $('#mapAWSVars').show();
                leafletMapLogFiles(json);
            } else {
                $('a[href="#dispawssp"]').hide();
                $('#mapAWSVars').hide();

                displayTextLogFiles(json, logtype);
            }
            // console.log(json)
            LOG_DATA = json;
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

/////////////

function displayTextLogFiles(json, logtype) {
    $('#contQCTable').empty();

    if (json.status == "no-data") {
        json.log = ["No log files found"]
    }
    var kolor = '#d1ecf1';
    var txtkol = '#0c5460';
    if (logtype == "logupload") {
        kolor = '#f8d7da';
        txtkol = '#721c24';
    }

    $.each(json.log, (ix) => {
        if (logtype == "logproc" && json.status == "ok") {
            kolor = json.update[ix] ? '#d4edda' : '#f8d7da';
            txtkol = json.update[ix] ? '#155724' : '#721c24';
        }

        var pre = $('<pre>').css({
            'margin': '1px 10px 3px 10px',
            'color': txtkol,
            'background-color': kolor
        });
        $('<code>')
            .text(json.log[ix])
            .appendTo(pre);
        $('#contQCTable').append(pre);
    });
}

/////////////

function leafletMapLogFiles(json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });

    ////////
    if (json.status == "no-data") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No available Log Files ")
            .openOn(mymap);
        return false;
    }
    mymap.closePopup();

    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";

    ////////

    $.each(json.log, (ix) => {
        var don = json.log[ix];
        var crd = don.crd[0];
        var log = don.msg;

        var txttip = '<b>ID : </b>' + crd.id + '<br>' + '<b>NAME : </b>' +
            crd.stationName + '<br>' + '<b>GROUP : </b>' + crd.AWSGroup;

        var lalo = new L.LatLng(crd.latitude, crd.longitude);
        var marker = L.marker(lalo)
            .bindTooltip(txttip, text2Op)
            .addTo(mymap);
        mymarkersBE.push(marker);

        // 
        marker.on('click', (e) => {
            $("#contQCTable").empty();
            $('a[href="#dispawsqc"]').click();

            // 
            var div0 = $('<div>').css({
                'margin-top': '5px',
                'margin-bottom': '1px',
                'text-align': 'center',
            }).appendTo("#contQCTable");

            var titre = '<b>ID : </b>' + crd.id + '&nbsp;&nbsp;<b>NAME : </b>' +
                crd.stationName + '&nbsp;&nbsp;<b>GROUP : </b>' + crd.AWSGroup;
            $('<p>').html(titre).appendTo(div0);

            var kolor = '#f8d7da';
            var txtkol = '#721c24';

            $.each(log, (j) => {
                var pre = $('<pre>').css({
                    'margin': '1px 10px 3px 10px',
                    'color': txtkol,
                    'background-color': kolor
                });
                $('<code>')
                    .text(log[j])
                    .appendTo(pre);
                $('#contQCTable').append(pre);
            });
        });
    });
}