function setAWSHourlyMSLPTime() {
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute3', '#pentad3', '#dekad3').hide();

    //
    var daty = new Date();

    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    var vhour = daty.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
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
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
}

//////////

function hourlyMSLPbindPopup(don, date) {
    var content = '<b> Date : </b>' + date + '<br>' +
        '<b>ID : </b>' + don.id +
        '; <b>NAME : </b>' + don.name +
        '; <b>NETWORK : </b>' + don.network + '<br>' +
        "<b>Longitude: </b>" + don.longitude + '<br>' +
        "<b>Latitude: </b>" + don.latitude + '<br>' +
        "<b>Altitude: </b>" + don.altitude + " m" + '<br>' +
        "<b>Air Temperature: </b>" + don.TAVG + " °C" + '<br>' +
        "<b>Station Pressure: </b>" + don.PRESAVG + " hPa" + '<br>' +
        "<b>MSLP : </b>" + don.MSLP + ' hPa';

    var div = $('<div>');
    $('<p>').addClass("awsTablebindPopupP")
        .html(content).appendTo(div);

    return div;
}

//////////

function leaflet_Map_HourlyMSLP(json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });

    // //////
    if (json.status == "no-data") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No available data")
            .openOn(mymap);
        return false;
    }
    mymap.closePopup();
    // 
    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";

    //
    $.each(json.data, (ix) => {
        var don = json.data[ix];
        if (don.MSLP == null && don.PRESAVG == null) {
            return;
        }

        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");
        var dispMSLP = (don.MSLP == null) ? "" : Math.round(don.MSLP);

        $('<span>').addClass("pin-label")
            .html(dispMSLP)
            .appendTo(divIco);
        divIconHtml.append(divIco);

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.stationName + '<br>' + '<b>GROUP : </b>' + don.AWSGroup;
        var tablePopup = hourlyMSLPbindPopup(don, json.date).prop('outerHTML');
        //
        var icon = L.divIcon({
            iconSize: null,
            iconAnchor: new L.Point(15, 30),
            popupAnchor: new L.Point(0, -15),
            className: 'pindivIcon' + ix,
            html: divIconHtml.prop('outerHTML')
        });

        var lalo = new L.LatLng(don.latitude, don.longitude);
        var marker = L.marker(lalo, { icon: icon })
            .bindPopup(tablePopup)
            .bindTooltip(txttip, text2Op)
            .addTo(mymap);
        mymarkersBE.push(marker);
        // 
        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[ix]);
        // 
        marker.on('click', (e) => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
            var goPin = '.pindivIcon' + ix;
            var thisPin = goPin + ' .pin';
            $(thisPin).css("background-color", 'red');
            lastIconActive = goPin;
        });
        // 
        marker.getPopup().on('remove', () => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
        });
    });
    // 
    mymap.on('click', (e) => {
        if (lastIconActive != "") {
            var activePin = lastIconActive + ' .pin';
            $(activePin).css("background-color", '#3071a9');
        }
    });
    //
    $('#colKeyMapVar').empty();

    var titre = "Mean Sea Level Pressure (hPa)";
    $('<p>').html(titre).css({
        'margin-top': '1px',
        'margin-bottom': '2px',
        'font-size': '10'
    }).appendTo('#colKeyMapVar');
    $('#colKeyMapVar').append(createColorKeyH(json.key));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '35px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);
}