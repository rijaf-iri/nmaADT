function setAWSAccumulRainTime() {
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2', '#minute3').hide();
    $('#pentad1, #pentad2', '#pentad3').hide();
    $('#dekad1, #dekad2', '#dekad3').hide();

    //
    lastDaty = new Date();
    lastDaty.setDate(lastDaty.getDate() - 90);
    var daty = new Date();

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
    var thisYear0 = lastDaty.getFullYear();
    $("#year1").val(thisYear0);
    $("#year2, #year3").val(thisYear);
    //
    $("#timestepDispTS").change(function() {
        if ($(this).val() == "hourly") {
            $(".aws-select-time td:last-child").show();
            $("#accumulTime").attr("max", "72");
        } else {
            $(".aws-select-time td:last-child").hide();
            $("#accumulTime").attr("max", "45");
        }
    });
    $("#timestepDispTS").trigger("change");
}

//////////

function rainAccumulbindPopup(don, date) {
    var tstep = $("#timestepDispTS option:selected").val();
    var suffix = (tstep == "hourly") ? "Hour" : "Day";
    var accum = $("#accumulTime").val();

    var content = '<b> Date : </b>' + date + '<br>' +
        '<b>ID : </b>' + don.id +
        '<b>; NAME : </b>' + don.name +
        '<b>; NETWORK : </b>' + don.network + '<br>' +
        "<b>Precipitation " + accum + "-" + suffix +
        " Accumulation : </b>" + don.accumul + ' mm';

    var div = $('<div>');
    $('<p>').addClass("awsTablebindPopupP")
        .html(content).appendTo(div);

    return div;
}

//////////

function highcharts_TS_RainAccumul(json) {
    if (json.opts.status != "plot") {
        if (json.opts.status == "no-data") {
            txt = "No available data"
        } else {
            txt = "unable to connect to database"
        }
        $('#errorMSG').css("background-color", "orange").html(txt);
        return false;
    }
    var options = {
        title: {
            text: json.opts.title
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: null
            },
            opposite: false,
            minorTickInterval: "auto",
            minorGridLineDashStyle: "LongDashDotDot"
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        },
        rangeSelector: {
            selected: 1
        }

    };

    var series = [{
        // type: 'area',
        data: json.data,
        name: json.opts.name,
        color: 'rgba(9, 133, 43, 1)',
        // fillColor: {
        //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        //     stops: [
        //         [0, 'rgba(9, 133, 43, 0.99)'],
        //         [1, 'rgba(203, 247, 215, 0.1)']
        //     ]
        // },
        tooltip: {
            valueSuffix: ' mm',
            valueDecimals: 1
        }
    }];

    var exporting = {
        enabled: true,
        filename: json.opts.filename,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        }
    };

    // 
    options.exporting = exporting;
    options.series = series;

    Highcharts.stockChart('contAWSGraph', options);
}

//////////

function leaflet_Map_RainAccumul(json) {
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
    if (json.status == "failed-connection") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("Unable to connect to the database")
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
        if (don.accumul == null) {
            return;
        }

        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");
        $('<span>').addClass("pin-label")
            .html(Math.round(don.accumul))
            .appendTo(divIco);
        divIconHtml.append(divIco);

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.name + '<br>' + '<b>NETWORK : </b>' + don.network;
        var tablePopup = rainAccumulbindPopup(don, json.date).prop('outerHTML');
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

    var titre = "Rainfall Accumulation (mm)";
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