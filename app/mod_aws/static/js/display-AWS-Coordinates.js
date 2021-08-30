$(document).ready(() => {
    var mymap = L.map('mapAWSCoords', {
        center: [mapCenterLAT, mapCenterLON],
        minZoom: 2,
        zoom: 6,
        zoomControl: false
    });

    //////
    new L.Control.Zoom({
        position: 'bottomright'
    }).addTo(mymap);
    new L.Control.Scale({
        position: 'bottomleft',
        imperial: false
    }).addTo(mymap);
    new L.control.mousePosition({
        position: 'bottomleft',
        lngFormatter: funlonFrmt,
        latFormatter: funlatFrmt
    }).addTo(mymap);

    //////
    var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    attribu = attribu + ' | <a href="https://www.ethiomet.gov.et">NMA</a>';
    var mytile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: attribu,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
    }).addTo(mymap);
    mytileBE = mytile;

    /////
    var icons = {
        blue: {
            icon: blueIcon
        },
        orange: {
            icon: orangeIcon
        },
        red: {
            icon: redIcon
        },
        green: {
            icon: greenIcon
        },
        violet: {
            icon: violetIcon
        }
    };
    //////

    $('#jsonTable thead tr').html('');
    $('#jsonTable tbody tr').html('');
    $.getJSON('/dispAWSCoordsMap', (json) => {
        var colHeader = Object.keys(json[1]);
        colHeader.splice(11, 3);
        for (var i = 0; i < colHeader.length; i++) {
            $('#jsonTable thead tr').append('<th>' + colHeader[i] + '</th>');
        }
        $.each(json, function() {
            var cont1 = '<b>' + 'id : ' + this.id + '</b>' + '<br>' + 'station_name : ' + this.name;
            var cont2 = '<br>' + 'longitude : ' + this.longitude + '<br>' + 'latitude : ' + this.latitude;
            var cont3 = '<br>' + 'altitude : ' + this.altitude + '<br>' + 'woreda : ' + this.woreda;
            var cont4 = '<br>' + 'zone : ' + this.zone + '<br>' + 'region : ' + this.region;
            var cont5 = '<br>' + 'AWS Network : ' + this.network + '<br>';
            var cont6 = '<br>' + 'Start : ' + this.startdate + '<br>' + 'End : ' + this.enddate;
            // var cont7 = '<br>' + 'Parameters : ' + this.PARS + '<br>';
            // var contenu = cont1 + cont2 + cont3 + cont4 + cont5 + cont6 + cont7;
            var contenu = cont1 + cont2 + cont3 + cont4 + cont5 + cont6;
            if (this.LonX != null) {
                L.marker([this.LatX, this.LonX], { icon: icons[this.StatusX].icon })
                    .bindPopup(contenu).addTo(mymap);
            } else {
                $('#jsonTable tbody').append('<tr></tr>');
                $.each($(this).get(0), function(index, value) {
                    if (['StatusX', 'LonX', 'LatX'].includes(index)) {
                        return;
                    }
                    $('#jsonTable tbody tr').last().append('<td>' + value + '</td>');
                });
            }
        });
    });
    //////
    $("#maptype").on("change", () => {
        mymap.removeLayer(mytile);
        mymap.attributionControl.removeAttribution();
        var maptype = $("#maptype option:selected").val();
        if (maptype == "openstreetmap") {
            mytile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: attribu,
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(mymap);
        } else if (maptype == "googlemaps") {
            mytile = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Maps',
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }).addTo(mymap);
        } else {
            var mapid = '';
            if (maptype == "mapboxsatellite") {
                mapid = 'satellite-v9';
            } else if (maptype == "mapboxstreets") {
                mapid = 'streets-v11';
            } else if (maptype == "mapboxoutdoors") {
                mapid = 'outdoors-v11';
            } else if (maptype == "mapboxlight") {
                mapid = 'light-v10';
            } else {
                mapid = 'satellite-streets-v11';
            }
            var attribu1 = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
            attribu1 = attribu1 + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
            attribu1 = attribu1 + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
            mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: attribu1,
                maxZoom: 23,
                id: mapid,
                accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
            }).addTo(mymap);
        }
        window.mytile = mytile;
        mytileBE = mytile;
    });

    //////

    var printer = L.easyPrint({
        tileLayer: mytileBE,
        exportOnly: true,
        hideControlContainer: false,
        hidden: true
    }).addTo(mymap);

    $("#downLeafletMap").on("click", () => {
        printer.printMap('CurrentSize', 'aws_map');
    });
});