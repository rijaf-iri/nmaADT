function setQCOutputTime() {
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    $('#minute3', '#pentad3', '#dekad3').hide();

    //
    var timestep = $("#timestepDispTS option:selected").val();
    lastDaty = new Date();
    lastDaty.setDate(lastDaty.getDate() - 30);
    var daty = new Date();

    if (timestep == "hourly") {
        daty.setHours(daty.getHours() - 1);
    } else {
        daty.setDate(daty.getDate() - 1);
    }

    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2, #hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    // var vhour = daty.getHours();
    // $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    var vhour0 = lastDaty.getHours();
    $("#hour1").val((vhour0 < 10 ? "0" : "") + vhour0);
    var vhour = daty.getHours();
    $("#hour2, #hour3").val((vhour < 10 ? "0" : "") + vhour);

    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2, #day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    // var vday = daty.getDate();
    // $("#day3").val((vday < 10 ? "0" : "") + vday);
    var vday0 = lastDaty.getDate();
    $("#day1").val((vday0 < 10 ? "0" : "") + vday0);
    var vday = daty.getDate();
    $("#day2, #day3").val((vday < 10 ? "0" : "") + vday);

    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2, #month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    // var vmon = daty.getMonth() + 1;
    // $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    var vmon0 = lastDaty.getMonth() + 1;
    $("#month1").val((vmon0 < 10 ? "0" : "") + vmon0);
    var vmon = daty.getMonth() + 1;
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    // $("#year3").val(thisYear);
    var thisYear0 = lastDaty.getFullYear();
    $("#year1").val(thisYear0);
    $("#year2, #year3").val(thisYear);
    //

    if (timestep == "hourly") {
        $(".aws-select-time td:last-child").show();
    } else {
        $(".aws-select-time td:last-child").hide();
    }
}

/////////////

function leafletMapQCoutput(json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });

    ////////
    if (json.status == "no-data") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No available QC outputs")
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

    $.each(json.data, (ix) => {
        var don = json.data[ix];
        var crd = don.crd[0];
        var qc = don.qc;

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

            // 
            var daty = Object.keys(qc);

            for (var j = 0; j < daty.length; j++) {
                var colHeader = Object.keys(qc[daty[j]][0]);
                var colNb = colHeader.length;
                // 
                // var div = $('<div>').css({
                //     'margin-top': '5px',
                //     'margin-bottom': '5px',
                // });
                var div = $('<div>').css('margin', '2px 10px 5px 10px');

                var table = $('<table>')
                    .addClass('jsonTable')
                    .attr('id', 'jsonTable');

                var rowh = $('<tr>');
                $('<th>').text('Date').appendTo(rowh);
                for (var i = 0; i < colNb; i++) {
                    $('<th>').text(colHeader[i])
                        .appendTo(rowh);
                }
                table.append(rowh);

                var row = $('<tr>');
                $('<td>').text(daty[j]).appendTo(row);
                for (var i = 0; i < colNb; i++) {
                    $('<td>').text(qc[daty[j]][0][colHeader[i]])
                        .appendTo(row);
                }
                table.append(row);

                div.append(table);
                $("#contQCTable").append(div);
            }
        });
    });
}