var mapCenterLON = 40.5;
var mapCenterLAT = 9.5;

/////////////////

var AWS_DATA = new Object();
AWS_DATA.status = "no-data";
var AWS_JSON = "";
var AWS_INFO = "";

// integrate to R function
var AWS_TimeRange = "";

// 
var AWS_dataMinVarObj;
$.getJSON(Flask.url_for("static", {
    "filename": "json/AWS_dataMinVarObj.json"
}), (json) => {
    AWS_dataMinVarObj = json.variables;
});
// 
var AWS_dataAggrVarObj;
//
var AWS_dataHourVarObj;
$.getJSON(Flask.url_for("static", {
    "filename": "json/AWS_dataHourVarObj.json"
}), (json) => {
    AWS_dataHourVarObj = json.variables;
});

//
var AWS_dataDayVarObj;
$.getJSON(Flask.url_for("static", {
    "filename": "json/AWS_dataDayVarObj.json"
}), (json) => {
    AWS_dataDayVarObj = json.variables;
});

/////////////////

// Initialize leaflet map
var mymapBE;
var mytileBE;
var zoomBE;
var scaleBE;
var mouseposBE;
var mymarkersBE = [];
var myimagesPNG = [];
var myimageMASK;
var myparsMASK;
var mypolarAxis = [];

// HighCharts data export
var EXPORT_DATA = false;
var chartButtonMenuItems = [
    'viewFullscreen', 'printChart', 'separator',
    'downloadPNG', 'downloadJPEG', 'downloadPDF'
];

/////////////////

// container toggle
$(() => {
    $('.input-container-title').on('click', function(event) {
        event.preventDefault();
        var accordion = $(this);
        var accordionContent = accordion.next('.input-container-content');
        accordion.toggleClass("open");
        accordionContent.slideToggle(250);
        // 
        if (accordion.hasClass("open")) {
            $(this).parent()
                .find(".glyphicon-plus")
                .removeClass("glyphicon-plus")
                .addClass("glyphicon-minus");
        } else {
            $(this).parent()
                .find(".glyphicon-minus")
                .removeClass("glyphicon-minus")
                .addClass("glyphicon-plus");
        }
    });
    $('.input-container .input-container-title').first().click();
});

/////////////////

// format lon
function funlonFrmt(lon) {
    var degre, minute, second;
    xlon = (lon < 0) ? Math.abs(lon) : lon;
    degre = Math.floor(xlon);
    lonm = (xlon - degre) * 60;
    minute = Math.floor(lonm);
    second = (lonm - minute) * 60;
    suffix = (lon < 0) ? 'W' : 'E';
    long = degre + 'º ' + minute + "' " + second.toFixed(2) + '" ' + suffix;
    return long;
}

// format lat
function funlatFrmt(lat) {
    var degre, minute, second;
    xlat = (lat < 0) ? Math.abs(lat) : lat;
    degre = Math.floor(xlat);
    latm = (xlat - degre) * 60;
    minute = Math.floor(latm);
    second = (latm - minute) * 60;
    suffix = (lat < 0) ? 'S' : 'N';
    lati = degre + 'º ' + minute + "' " + second.toFixed(2) + '" ' + suffix;
    return lati;
}

/////////////////
// colorkey

function createColorKeyV(ckey) {
    // ckey.labels = ckey.labels.reverse();
    // ckey.colors = ckey.colors.reverse();
    var colh = 96 / ckey.labels.length;
    //
    var table = $('<table>').addClass('ckeyv');
    var row = $('<tr>');
    var col = $('<td>').addClass('ckeyv-color cl-top').attr('rowspan', 2)
        .css('background-color', ckey.colors[0]);
    row.append(col);
    col = $('<td>').addClass('ckeyv-tick').attr('rowspan', 2);
    row.append(col);
    col = $('<td>').addClass('ckeyv-label').attr('rowspan', 1)
        .css('height', '2%');
    row.append(col);
    table.append(row);
    //
    for (j = 0; j < ckey.labels.length; j++) {
        row = $('<tr>');
        col = $('<td>').addClass('ckeyv-label').attr('rowspan', 2)
            .attr('align', 'center').css('height', colh + '%')
            .text(ckey.labels[j]);
        row.append(col);
        table.append(row);
        //
        var class_cl = 'ckeyv-color';
        var class_tk = 'ckeyv-tick';
        if (j == ckey.labels.length - 1) {
            class_cl = class_cl + ' cl-bottom';
            class_tk = class_tk + ' tk-bottom';
        }
        //
        row = $('<tr>');
        col = $('<td>').addClass(class_cl).attr('rowspan', 2)
            .css('background-color', ckey.colors[j + 1]);
        row.append(col);
        col = $('<td>').addClass(class_tk).attr('rowspan', 2);
        row.append(col);
        table.append(row);
    }
    //
    row = $('<tr>');
    col = $('<td>').addClass('ckeyv-label').attr('rowspan', 1)
        .css('height', '2%');
    row.append(col);
    table.append(row);
    //
    return table;
}
// 
function createColorKeyH(ckey) {
    var classrow = ["ckeyh-color", "ckeyh-tick", "ckeyh-label"];
    var colw = 96 / ckey.labels.length;
    var table = $('<table>').addClass('ckeyh');
    for (i = 0; i < 3; i++) {
        var row = $('<tr>').addClass(classrow[i]);
        if (i == 0) {
            for (j = 0; j < ckey.colors.length; j++) {
                var col = $('<td>').css('background-color', ckey.colors[j]).attr('colspan', 2);
                row.append(col);
            }
        }
        if (i == 1) {
            for (j = 0; j < ckey.colors.length; j++) {
                var col = $('<td>').attr('colspan', 2);
                row.append(col);
            }
        }
        if (i == 2) {
            var col1 = $('<td>').css('width', '2%').attr('colspan', 1);
            row.append(col1);
            for (j = 0; j < ckey.labels.length; j++) {
                var col = $('<td>').css('width', colw + '%').attr('colspan', 2).text(ckey.labels[j]);
                row.append(col);
            }
            var col2 = $('<td>').css('width', '2%').attr('colspan', 1);
            row.append(col2);
        }
        table.append(row);
    }
    //
    return table;
}

/////////////////
// aws colorkey

function getVarNameColorKey(pars) {
    var x = pars.split("_")[0];
    if (x == "1") { return 'PR'; }
    if (x == "2") { return 'TT'; }
    if (x == "3") { return 'TD'; }
    if (x == "4") { return 'LWT'; }
    if (x == "5") { return 'RR'; }
    if (x == "6") { return 'RH'; }
    if (x == "7") { return 'SM'; }
    if (x == "8") { return 'RG'; }
    if (x == "10" | x == "11") { return 'FF'; }
    if (x == "14") { return 'ST'; }
}

/////////////////

function createLeafletTileLayer(container, aws_tile = true) {
    if (mymapBE == undefined) {
        // create map
        var mymap = L.map(container, {
            center: [mapCenterLAT, mapCenterLON],
            minZoom: 2,
            zoom: 5.8,
            zoomControl: false
        });
        // 
        zoomBE = new L.Control.Zoom({
            position: 'bottomright'
        }).addTo(mymap);
        scaleBE = new L.Control.Scale({
            position: 'bottomleft',
            imperial: false
        }).addTo(mymap);
        mouseposBE = new L.control.mousePosition({
            position: 'bottomleft',
            lngFormatter: funlonFrmt,
            latFormatter: funlatFrmt
        }).addTo(mymap);
        // 
        var meteo = ' | <a href="http://www.ethiomet.gov.et/">NMA</a>';
        if (aws_tile) {
            var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
            var mytile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: attribu + meteo,
                maxZoom: 19,
                subdomains: ["a", "b", "c"]
            });
        } else {
            // var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
            // var mytile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            //     attribution: attribu + meteo,
            //     subdomains: 'abcd',
            //     maxZoom: 19
            // });
            var attribu = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
            attribu = attribu + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
            attribu = attribu + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
            mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: attribu + meteo,
                maxZoom: 23,
                id: 'light-v10',
                accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
            });
        }
        mytile.addTo(mymap);

        ////
        mytileBE = mytile;
        mymapBE = mymap;
    } else {
        var mymap = mymapBE;
        mymap.invalidateSize();
        // remove markers
        if (mymarkersBE.length > 0) {
            for (i = 0; i < mymarkersBE.length; i++) {
                mymap.removeLayer(mymarkersBE[i]);
            }
            mymarkersBE = [];
        }
        // remove images layers
        if (myimagesPNG.length > 0) {
            for (i = 0; i < myimagesPNG.length; i++) {
                if (myimagesPNG[i]) {
                    mymap.removeLayer(myimagesPNG[i]);
                }
            }
            myimagesPNG = [];
        }
        // remove other Layers
        if (mypolarAxis.length > 0) {
            for (i = 0; i < mypolarAxis.length; i++) {
                mymap.removeLayer(mypolarAxis[i]);
            }
            mypolarAxis = [];
        }
    }

    return mymap;
}

////////////////////////

function changeLeafletTileLayer(container) {
    $(container).on("change", () => {
        var mytile = mytileBE;
        var mymap = mymapBE;
        mymap.removeLayer(mytile);
        mymap.attributionControl.removeAttribution();
        //
        if (myimagesPNG.length > 0) {
            for (i = 0; i < myimagesPNG.length; i++) {
                if (myimagesPNG[i]) {
                    mymap.removeLayer(myimagesPNG[i]);
                }
            }
        }

        var basemap = $(container + " option:selected").val();
        var meteo = ' | <a href="http://www.ethiomet.gov.et/">NMA</a>';

        switch (basemap) {
            case "openstreetmap":
                var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
                mytile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: attribu + meteo,
                    maxZoom: 19,
                    subdomains: ["a", "b", "c"]
                });
                break;
            case "cartodb-dark":
                var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                mytile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: attribu + meteo,
                    subdomains: 'abcd',
                    maxZoom: 19
                });
                break;
            case "mapboxlight":
                var attribu = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
                attribu = attribu + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
                attribu = attribu + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
                mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: attribu + meteo,
                    maxZoom: 23,
                    id: 'light-v10',
                    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
                });
                break;
            case "esriworldimagery":
                var attribu = '&copy; <a href="http://www.esri.com/">Esri</a>, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, <br> IGN, IGP, UPR-EGP, and the GIS User Community';
                mytile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: attribu + meteo,
                    maxZoom: 18
                });
        }

        mytile.addTo(mymap);
        window.mytile = mytile;
        mytileBE = mytile;
        // 
        if (myimagesPNG.length > 0) {
            for (i = 0; i < myimagesPNG.length; i++) {
                if (myimagesPNG[i]) {
                    mymap.addLayer(myimagesPNG[i]);
                }
            }
        }
    });
}

////////////////////////

function easyPrintMap() {
    var mymap = mymapBE;
    var mytile = mytileBE;

    var printer = L.easyPrint({
        tileLayer: mytile,
        exportOnly: true,
        hideControlContainer: false,
        hidden: true
    }).addTo(mymap);

    return printer;
}

////////////////////////

// http://spin.js.org/
// leaflet spin css
var spinner_opts = {
    lines: 13, // The number of lines to draw
    length: 38, // The length of each line
    width: 17, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#ffffff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: 'spinner', // The CSS class to assign to the spinner
    position: 'absolute', // Element positioning
};

/////////////////

// aws map popup table
function awsSpatialbindPopup_Min(don, date, labelObj, labelT) {
    var div = $('<div>');
    var popTitre = '<b>' + labelT + ': </b>' + date + '<br>' +
        '<b>ID : </b>' + don.id + '<b>; NAME : </b>' +
        don.name + '<b>; NETWORK : </b>' + don.network;
    $('<p>').html(popTitre).addClass("awsTablebindPopupP").appendTo(div);

    var table = $('<table>').addClass('awsTablebindPopup');
    var head = $('<tr>').addClass('awsTablebindPopupTh');
    var head1 = $('<th>').text("Variable");
    head.append(head1);
    var head2 = $('<th>').text("Value");
    head.append(head2);
    var head3 = $('<th>').text("Units");
    head.append(head3);
    table.append(head);
    for (i = 0; i < labelObj.length; i++) {
        var id_var = labelObj[i].var_code + '_' + labelObj[i].height + '_' + labelObj[i].stat_code;
        var val = don[id_var];
        if (val == null | val == undefined) { continue; }

        var row = $('<tr>').addClass('awsTablebindPopupTr');
        var txt_var = labelObj[i].var_name + ' at ' + labelObj[i].height + 'm' + ' [' + labelObj[i].stat_name + ']';
        var col1 = $('<td>').text(txt_var);
        row.append(col1);

        val = Math.round((val + Number.EPSILON) * 10) / 10;
        var col2 = $('<td>').text(val);
        row.append(col2);
        var col3 = $('<td>').html(labelObj[i].var_units);
        row.append(col3);
        table.append(row);
    }
    div.append(table);
    return div;
}

function awsSpatialbindPopup_Aggr(don, date, labelObj, labelT) {
    var stateNames = ["", "avg", "min", "max", "tot"];
    var div = $('<div>');
    var popTitre = '<b>' + labelT + ': </b>' + date + '<br>' +
        '<b>ID : </b>' + don.id + '<b>; NAME : </b>' +
        don.name + '<b>; NETWORK : </b>' + don.network;
    $('<p>').html(popTitre).addClass("awsTablebindPopupP").appendTo(div);

    var table = $('<table>').addClass('awsTablebindPopup');
    var head = $('<tr>').addClass('awsTablebindPopupTh');
    var head1 = $('<th>').text("Variable");
    head.append(head1);
    var head2 = $('<th>').text("Value");
    head.append(head2);
    var head3 = $('<th>').text("Units");
    head.append(head3);
    table.append(head);
    for (i = 0; i < labelObj.length; i++) {
        for (v = 1; v < 5; v++) {
            var id_var = labelObj[i].var_code + '_' + labelObj[i].height + '_' + v;
            var val = don[id_var];
            if (val == null | val == undefined) { continue; }

            var row = $('<tr>').addClass('awsTablebindPopupTr');
            var txt_var = labelObj[i].var_name + ' at ' + labelObj[i].height + 'm' + ' [' + stateNames[v] + ']';
            var col1 = $('<td>').text(txt_var);
            row.append(col1);

            val = Math.round((val + Number.EPSILON) * 10) / 10;
            var col2 = $('<td>').text(val);
            row.append(col2);
            var col3 = $('<td>').html(labelObj[i].var_units);
            row.append(col3);
            table.append(row);
        }
    }
    div.append(table);
    return div;
}

/////////////////

Number.prototype.mod = function(x) {
    return ((this % x) + x) % x;
}

Date.prototype.format = function(mask, utc) {
    return dateFormat(this, mask, utc);
};

Date.prototype.getDekad = function() {
    var day = this.getDate();
    var dek;
    if (day < 11) {
        dek = 1;
    } else if (day > 10 && day < 21) {
        dek = 2;
    } else {
        dek = 3;
    }
    return dek;
};

Date.prototype.setDekad = function(n) {
    var dek = n.mod(3);
    dek = (dek == 0) ? 3 : dek;
    var dek1;
    switch (dek) {
        case 1:
            dek1 = 5;
            break;
        case 2:
            dek1 = 15;
            break;
        case 3:
            dek1 = 25;
    }

    var im = Math.floor((n - 1) / 3);
    this.setMonth(this.getMonth() + im);
    var mon = this.getMonth() + 1;
    var dStr = this.getFullYear() + '-' + mon + '-' + dek1 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

Date.prototype.getPentad = function() {
    var day = this.getDate();
    var pen;
    if (day < 6) {
        pen = 1;
    } else if (day > 5 && day < 11) {
        pen = 2;
    } else if (day > 10 && day < 16) {
        pen = 3;
    } else if (day > 15 && day < 21) {
        pen = 4;
    } else if (day > 20 && day < 26) {
        pen = 5;
    } else {
        pen = 6;
    }
    return pen;
};

Date.prototype.setPentad = function(n) {
    var pen = n.mod(6);
    pen = (pen == 0) ? 6 : pen;
    var pen1;
    switch (pen) {
        case 1:
            pen1 = 3;
            break;
        case 2:
            pen1 = 7;
            break;
        case 3:
            pen1 = 13;
            break;
        case 4:
            pen1 = 17;
            break;
        case 5:
            pen1 = 23;
            break;
        case 6:
            pen1 = 27;
    }

    var im = Math.floor((n - 1) / 6);
    this.setMonth(this.getMonth() + im);
    var mon = this.getMonth() + 1;
    var dStr = this.getFullYear() + '-' + mon + '-' + pen1 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

////////////////////////////

function convertDate2UTC(date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );
}

////////////////////////////

function startEndDateTime(timestep, obj) {
    var start_date = "";
    var end_date = "";

    if (timestep == "hourly") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1 + "-" + obj.hour1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2 + "-" + obj.hour2;
    } else if (timestep == "pentad") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.pentad1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.pentad2;
    } else if (timestep == "dekadal") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.dekad1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.dekad2;
    } else if (timestep == "monthly") {
        start_date = obj.year1 + "-" + obj.month1;
        end_date = obj.year2 + "-" + obj.month2;
    } else if (timestep == "daily") {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2;
    } else {
        start_date = obj.year1 + "-" + obj.month1 + "-" + obj.day1 + "-" + obj.hour1 + "-" + obj.minute1;
        end_date = obj.year2 + "-" + obj.month2 + "-" + obj.day2 + "-" + obj.hour2 + "-" + obj.minute2;
    }

    var vrange = new Object();
    vrange['start'] = start_date;
    vrange['end'] = end_date;
    return vrange;
}

///////////

function getDateMapMin() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();
    var minute3 = $("#minute3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' ' + hour3 + ':' + minute3 + ':00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMapMin() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();
    var minute3 = $("#minute3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3 + '-' + hour3 + '-' + minute3;
    return daty;
}

///////////

function getDateMap1Hour() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' ' + hour3 + ':00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Hour() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();
    var hour3 = $("#hour3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3 + '-' + hour3;
    return daty;
}

///////////

function getDateMap1Day() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + day3 + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Day() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var day3 = $("#day3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + day3;
    return daty;
}

///////////

function getDateMap1Month() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();

    var dStr = year3 + '-' + month3 + '-' + '15' + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Month() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();

    var daty = year3 + '-' + month3 + '-15';
    return daty;
}

///////////

function getDateMap1Pentad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var pentad3 = parseInt($("#pentad3 option:selected").val());

    var pen;
    switch (pentad3) {
        case 1:
            pen = 3;
            break;
        case 2:
            pen = 7;
            break;
        case 3:
            pen = 13;
            break;
        case 4:
            pen = 17;
            break;
        case 5:
            pen = 23;
            break;
        case 6:
            pen = 27;
    }

    var dStr = year3 + '-' + month3 + '-' + pen + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function formatDateMap1Pentad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var pentad3 = $("#pentad3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + pentad3;
    return daty;
}

///////////

function getDateMap1Dekad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var dekad3 = parseInt($("#dekad3 option:selected").val());

    var dek;
    switch (dekad3) {
        case 1:
            dek = 5;
            break;
        case 2:
            dek = 15;
            break;
        case 3:
            dek = 25;
    }

    var dStr = year3 + '-' + month3 + '-' + dek + ' 00:00:00';
    var daty = new Date(dStr);
    return daty;
}

function fromatDateMap1Dekad() {
    var year3 = $("#year3 option:selected").val();
    var month3 = $("#month3 option:selected").val();
    var dekad3 = $("#dekad3 option:selected").val();

    var daty = year3 + '-' + month3 + '-' + dekad3;
    return daty;
}

///////////

function selectTimesTsMap(n, ctable, label, pname, showlab) {
    var table = $(ctable);
    if (showlab) {
        var row1 = $('<tr>');
        for (var i = 0; i < label.length; i++) {
            var col = $('<td>').append("<strong>" + label[i] + "</strong>");
            row1.append(col);
        }
        table.append(row1);
    }

    var row2 = $('<tr>');
    for (var i = 0; i < label.length; i++) {
        var col = $('<td>');
        var select = $('<select>').attr('id', pname[i] + n).attr('name', pname[i] + n);
        select.append('<option value="" selected disabled hidden></option>')
        col.append(select);
        row2.append(col);
    }
    table.append(row2);

    return (table)
}

///////////

function checkDateTimeRange() {
    var timestep = $("#timestepDispTS option:selected").val();
    var year1 = $("#year1 option:selected").val();
    var year2 = $("#year2 option:selected").val();
    var month1 = $("#month1 option:selected").val();
    var month2 = $("#month2 option:selected").val();
    var dekad1 = $("#dekad1 option:selected").val();
    var dekad2 = $("#dekad2 option:selected").val();
    var pentad1 = $("#pentad1 option:selected").val();
    var pentad2 = $("#pentad2 option:selected").val();
    var day1 = $("#day1 option:selected").val();
    var day2 = $("#day2 option:selected").val();
    var hour1 = $("#hour1 option:selected").val();
    var hour2 = $("#hour2 option:selected").val();
    var minute1 = $("#minute1 option:selected").val();
    var minute2 = $("#minute2 option:selected").val();
    //
    $('#errorMSG').css("background-color", "red");
    if (year1 == "") {
        $('#errorMSG').html("ERROR: Please select start year!");
        return false;
    }
    if (month1 == "") {
        $('#errorMSG').html("ERROR: Please select start month!");
        return false;
    }
    if (timestep == "minute" || timestep == "hourly" || timestep == "daily") {
        if (day1 == "") {
            $('#errorMSG').html("ERROR: Please select start day!");
            return false;
        }
        if (timestep == "hourly" && hour1 == "") {
            $('#errorMSG').html("ERROR: Please select start hour!");
            return false;
        }
    }
    if (timestep == "minute" && minute1 == "") {
        $('#errorMSG').html("ERROR: Please select start minute!");
        return false;
    }
    if (timestep == "pentad" && pentad1 == "") {
        $('#errorMSG').html("ERROR: Please select start pentad!");
        return false;
    }
    if (timestep == "dekadal" && dekad1 == "") {
        $('#errorMSG').html("ERROR: Please select start dekad!");
        return false;
    }
    if (year2 == "") {
        $('#errorMSG').html("ERROR: Please select end year!");
        return false;
    }
    if (month2 == "") {
        $('#errorMSG').html("ERROR: Please select end month!");
        return false;
    }
    if (timestep == "minute" || timestep == "hourly" || timestep == "daily") {
        if (day2 == "") {
            $('#errorMSG').html("ERROR: Please select end day!");
            return false;
        }
        if (timestep == "hourly" && hour2 == "") {
            $('#errorMSG').html("ERROR: Please select end hour!");
            return false;
        }
    }
    if (timestep == "minute" && minute2 == "") {
        $('#errorMSG').html("ERROR: Please select end minute!");
        return false;
    }
    if (timestep == "pentad" && pentad2 == "") {
        $('#errorMSG').html("ERROR: Please select end pentad!");
        return false;
    }
    if (timestep == "dekadal" && dekad2 == "") {
        $('#errorMSG').html("ERROR: Please select end dekad!");
        return false;
    }
    //
    $('#errorMSG').html("");
    $('#errorMSG').css("background-color", "none");
    //
    var vtimes = new Object();
    vtimes['year1'] = year1;
    vtimes['year2'] = year2;
    vtimes['month1'] = month1;
    vtimes['month2'] = month2;
    vtimes['dekad1'] = dekad1;
    vtimes['dekad2'] = dekad2;
    vtimes['pentad1'] = pentad1;
    vtimes['pentad2'] = pentad2;
    vtimes['day1'] = day1;
    vtimes['day2'] = day2;
    vtimes['hour1'] = hour1;
    vtimes['hour2'] = hour2;
    vtimes['minute1'] = minute1;
    vtimes['minute2'] = minute2;
    return vtimes;
}

////////////////////////////////

function setDateTimeMapDataMin(n) {
    var dObj = getDateMapMin();
    dObj.setMinutes(dObj.getMinutes() + n);
    //
    var vmin = dObj.getMinutes();
    $("#minute3").val((vmin < 10 ? "0" : "") + vmin);
    var vhour = dObj.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    var vday = dObj.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    var vmon = dObj.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);

    var years = $("#year3 option")
        .map(function() { return $(this).val(); })
        .get();
    years = years.map(x => Number(x));
    years = years.filter(x => x != 0);
    var minyr = Math.min(...years);
    var maxyr = Math.max(...years);

    var thisYear = dObj.getFullYear();
    var valYear;
    if (thisYear < minyr) {
        valYear = maxyr;
    } else if (thisYear > maxyr) {
        valYear = minyr;
    } else {
        valYear = thisYear;
    }
    $("#year3").val(valYear);
}

function setDateTimeMapData(n) {
    var timestep = $("#timestepDispTS option:selected").val();
    var dObj;

    if (timestep == "hourly") {
        dObj = getDateMap1Hour();
        dObj.setHours(dObj.getHours() + n);
        var vhour = dObj.getHours();
        $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
        var vday = dObj.getDate();
        $("#day3").val((vday < 10 ? "0" : "") + vday);
    } else if (timestep == "daily") {
        dObj = getDateMap1Day();
        dObj.setDate(dObj.getDate() + n);
        var vday = dObj.getDate();
        $("#day3").val((vday < 10 ? "0" : "") + vday);
    } else if (timestep == "pentad") {
        dObj = getDateMap1Pentad();
        dObj = dObj.setPentad(dObj.getPentad() + n);
        $("#pentad3").val(dObj.getPentad());
        // change def of setPentad to use it directly
    } else if (timestep == "dekadal") {
        dObj = getDateMap1Dekad();
        dObj = dObj.setDekad(dObj.getDekad() + n);
        $("#dekad3").val(dObj.getDekad());
        // change def of setDekad to use it directly
    } else {
        dObj = getDateMap1Month();
        dObj.setMonth(dObj.getMonth() + n);
    }

    var vmon = dObj.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);

    var years = $("#year3 option")
        .map(function() { return $(this).val(); })
        .get();
    years = years.map(x => Number(x));
    years = years.filter(x => x != 0);
    var minyr = Math.min(...years);
    var maxyr = Math.max(...years);

    var thisYear = dObj.getFullYear();
    var valYear;
    if (thisYear < minyr) {
        valYear = maxyr;
    } else if (thisYear > maxyr) {
        valYear = minyr;
    } else {
        valYear = thisYear;
    }
    $("#year3").val(valYear);
}

function getDateTimeMapData() {
    var timestep = $("#timestepDispTS option:selected").val();
    var daty;

    switch (timestep) {
        case "hourly":
            daty = formatDateMap1Hour();
            break;
        case "daily":
            daty = formatDateMap1Day();
            break;
        case "pentad":
            daty = formatDateMap1Pentad();
            break;
        case "dekadal":
            daty = fromatDateMap1Dekad();
            break;
        case "monthly":
            daty = formatDateMap1Month();
    }

    return daty;
}

////////////////////////////////

function hexToRGB(hexStr) {
    var col = {};
    col.r = parseInt(hexStr.substr(1, 2), 16);
    col.g = parseInt(hexStr.substr(3, 2), 16);
    col.b = parseInt(hexStr.substr(5, 2), 16);
    return col;
}

function hexToRGBA(hexStr, alpha = 1) {
    var col = {};
    col.r = parseInt(hexStr.substr(1, 2), 16);
    col.g = parseInt(hexStr.substr(3, 2), 16);
    col.b = parseInt(hexStr.substr(5, 2), 16);
    col.a = alpha;
    return col;
}

////////////////////////

function maskMapLayerPNG() {
    mask_thres1 = Number(myparsMASK.thres1);
    mask_thres2 = Number(myparsMASK.thres2);
    var val = myparsMASK.ckeys.labels.map(Number);
    var kol = myparsMASK.ckeys.colors;
    var kol1 = new Array();

    if (myparsMASK.opr == "<=") {
        for (var i = 1; i < kol.length; i++) {
            if (val[i - 1] <= mask_thres1) {
                kol1.push(kol[i]);
            }
        }
    } else if (myparsMASK.opr == ">=") {
        for (var i = 0; i < kol.length - 1; i++) {
            if (val[i] >= mask_thres1) {
                kol1.push(kol[i]);
            }
        }
    } else {
        for (var i = 1; i < kol.length; i++) {
            if (val[i - 1] <= mask_thres1) {
                kol1.push(kol[i]);
            }
        }
        for (var i = 0; i < kol.length - 1; i++) {
            if (val[i] >= mask_thres2) {
                kol1.push(kol[i]);
            }
        }
    }

    //
    if (kol1.length > 0) {
        var canvas = document.createElement("canvas");
        canvas.width = myimageMASK.width;
        canvas.height = myimageMASK.height;

        var context = canvas.getContext("2d");
        context.drawImage(myimageMASK, 0, 0);
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        raplaceColorAlpha({
            'data': imageData.data,
            'col': kol1
        }, (data) => {
            imageData.data = data;
            context.putImageData(imageData, 0, 0);
        });

        var out = canvas.toDataURL();
        canvas.remove();

        return out;
    }

    return null;
}

function raplaceColorAlpha(obj, callback) {
    var data = obj.data;
    for (var i = 0; i < obj.col.length; i++) {
        var rgb = hexToRGB(obj.col[i]);
        var r, g, b, a;
        for (var j = 0; j < data.length; j += 4) {
            r = data[j];
            g = data[j + 1];
            b = data[j + 2];
            // a = data[j + 3];
            if ((r == rgb.r) &&
                (g == rgb.g) &&
                (b == rgb.b)) {
                // data[j] = rgb.r;
                // data[j + 1] = rgb.g;
                // data[j + 2] = rgb.b;
                data[j + 3] = 0;
            }
        }
    }

    callback(data);
}

////////////////////////

// function getNestedObject(nestedObj, pathArr) {
//     return pathArr.reduce((obj, key) =>
//         (obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
// }

//
function getNestedObject(nestedObj, pathArr) {
    for (var i = 0; i < pathArr.length; i++) {
        nestedObj = nestedObj[pathArr[i]];
    }
    return nestedObj;
}

function updateNestedObject(nestedObj, pathArr, value) {
    var current = nestedObj;
    pathArr.forEach(function(key, index) {
        if (index === pathArr.length - 1) {
            current[key] = value;
        } else {
            // create the key if not exist
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }
    });
}

////////////////////////

function getHTMLElementValue(obj) {
    var ret;
    if (obj === undefined) {
        return ret;
    }

    var nodenm = obj[0].nodeName;
    var type = obj[0].type;

    switch (true) {
        case (nodenm === "SELECT" && type === "select-one"):
        case (nodenm === "INPUT" && type === "text"):
        case (nodenm === "INPUT" && type === "number"):
            ret = obj.val();
            break;
        case (nodenm === "INPUT" && type === "checkbox"):
            ret = obj.is(':checked');
    }

    return ret;
}

function getHTMLElementModal(object) {
    function recurse(obj, arr_key) {
        if (obj !== undefined) {
            if (typeof obj === 'object') {
                if (!(obj instanceof jQuery.fn.init)) {
                    var keys = Object.keys(obj);
                    if (keys.length) {
                        keys.forEach(function(k) {
                            recurse(obj[k], arr_key.concat(k));
                        });
                    }
                    return;
                }
            }

            if (obj instanceof jQuery.fn.init) {
                var res = getHTMLElementValue(obj);
                out.push({ "path": arr_key, "val": res })
            }
        }
    }

    var out = [];
    recurse(object, []);
    return out;
}

////////////////////////
function encodeQueryData(data) {
    var ret = [];
    for (var d in data)
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    return ret.join('&');
}
////////////////////////