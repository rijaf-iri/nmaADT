$(document).ready(() => {
    updateStatusMap();
    $("#updateStatus").on("click", updateStatusMap);

    $("#downLeafletMap").on("click", () => {
        var mymap = mymapBE;
        var json = AWS_DATA;

        var printer = easyPrintMap();
        printer.printMap('CurrentSize', 'aws_status' + '_' + json.time);

        setTimeout(() => {
            mymap.removeControl(printer);
        }, 2000);
    });
});

function updateStatusMap() {
    $.getJSON('/dispAWSStatusMap', {
            ltime: $("#lastAvail option:selected").val()
        },
        (json) => {
            $('#timeStatus').empty();
            $('#lastUpdate').empty();
            $('#timeStatus').html(json.time);
            $('#lastUpdate').html(json.update);

            AWS_DATA = json;
            leafletAWSStatusMap(json.data);
        });
}

function leafletAWSStatusMap(data) {
    var mymap = createLeafletTileLayer("mapAWSStatus");

    mymap.closePopup();
    // 
    var icons = {
        blue: {
            icon: blueIcon
        },
        green: {
            icon: greenIcon
        },
        yellow: {
            icon: goldIcon
        },
        orange: {
            icon: orangeIcon
        },
        red: {
            icon: redIcon
        }
    };

    $.each(data, function() {
        if ($("#dispallaws").is(':not(:checked)') & this.StatusX == 'red') {
            return;
        }

        var cont1 = '<b>id : </b>' + this.id + '<br>' + '<b>Station Name : </b>' + this.stationName;
        var cont2 = '<br>' + '<b>AWS Group : </b>' + this.AWSGroup + '<br>' + '<b>Time step : </b>' + this.timestep;
        var cont3 = '<br>' + '<b>Start : </b>' + this.start + '<br>' + '<b>End : </b>' + this.end;
        var cont4 = '<br>' + '<b>Availability : </b>' + this.Availability + '<br>';
        var contenu = cont1 + cont2 + cont3 + cont4;

        var marker = L.marker([this.latitude, this.longitude], { icon: icons[this.StatusX].icon })
            .bindPopup(contenu)
            .addTo(mymap);
        mymarkersBE.push(marker);
    });

}