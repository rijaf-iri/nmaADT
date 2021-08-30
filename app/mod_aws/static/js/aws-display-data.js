function getAWSInfos(aws) {
    var stn = new Object();
    var aws = aws.split('_');
    for (var i = 0; i < AWS_JSON.length; ++i) {
        if (AWS_JSON[i].network_code === aws[0] &&
            AWS_JSON[i].id === aws[1]) {
            stn = AWS_JSON[i];
        }
    }
    return stn;
}

//
function setAWSVariableSelect(aws) {
    $('#awsObsVar').empty();
    if ($.isArray(AWS_INFO.PARS)) {
        for (var i = 0; i < AWS_INFO.PARS.length; ++i) {
            var var_code = AWS_INFO.PARS[i];
            var var_name = AWS_INFO.PARS_Info[var_code][0].name;
            var var_height = AWS_INFO.height[var_code][0];

            for (hgt in var_height) {
                var vartxt = var_name + " @ " + hgt + "m";
                var varval = var_code + "_" + hgt;

                $('#awsObsVar').append(
                    $("<option>").text(vartxt).val(varval)
                );
            }
        }
    } else {
        // to check
        var var_code = AWS_INFO.PARS;
        var var_name = AWS_INFO.PARS_Info[var_code][0].name;
        var var_height = AWS_INFO.height[var_code][0];

        for (hgt in var_height) {
            var vartxt = var_name + " @ " + hgt + "m";
            var varval = var_code + "_" + hgt;

            $('#awsObsVar').append(
                $("<option>").text(vartxt).val(varval)
            );
        }
    }
    $('#awsObsVar option[value=5_1]').attr('selected', true);
}

//
function setAWSParamSelect(var_height) {
    $('#awsParams').empty();
    var var_height = var_height.split("_");
    var stat = AWS_INFO.STATS[var_height[0]][var_height[1]];

    for (var i = 0; i < stat.length; ++i) {
        $('#awsParams').append(
            $("<option>").text(stat[i].name).val(stat[i].code)
        );
    }
}

// 
function setAWSVariableSelect1() {
    $('#awsObsVar').empty();

    var Lvars = [];
    for (var i = 0; i < AWS_INFO.PARS.length; ++i) {
        var var_code = AWS_INFO.PARS[i];
        var var_height = AWS_INFO.height[var_code][0];
        for (hgt in var_height) {
            Lvars[i] = var_code + "_" + hgt;
        }
    }

    $.each(AWS_dataAggrVarObj, function() {
        var val = this.var_code + "_" + this.height;
        if (Lvars.includes(val)) {
            var txt = this.var_name + " @ " + this.height + "m";
            $('#awsObsVar').append(
                $("<option>").text(txt).val(val)
            );
        }
    });

    // $("#awsObsVar").val($("#awsObsVar option:first").val());
    $('#awsObsVar option[value=5_1]').attr('selected', true);
}
//

function setAWSParamSelect1(var_height) {
    $('#awsParams').empty();

    if (var_height == "5_1") {
        $('#arearange').prop('checked', false);
        $('#rangepars').hide();
        $('#awsParams').append(
            $("<option>").text("Total").val("Tot")
        );
    } else {
        $('#rangepars').show();
        valpars = ['Ave', 'Min', 'Max'];
        txtpars = ['Average', 'Minimum', 'Maximum'];
        for (var i = 0; i < valpars.length; ++i) {
            $('#awsParams').append(
                $("<option>").text(txtpars[i]).val(valpars[i])
            );
        }
    }
}

// TODO: replace to asynchronous
function getAWSTimeRange(url, data) {
    return $.ajax({
        url: url,
        data: data,
        async: false,
        dataType: 'json',
    }).responseJSON;
}

//
function getListMetadata() {
    var info = new Array();
    info[0] = "<b>AWS ID :</b> " + AWS_INFO.id;
    info[1] = "<b>AWS Name :</b> " + AWS_INFO.name;
    info[2] = "<b>AWS Network :</b> " + AWS_INFO.network;
    info[3] = "<b>Longitude :</b> " + AWS_INFO.longitude;
    info[4] = "<b>Latitude :</b> " + AWS_INFO.latitude;
    info[5] = "<b>Elevation :</b> " + AWS_INFO.altitude;
    info[6] = "<b>Woreda :</b> " + AWS_INFO.woreda;
    info[7] = "<b>Zone :</b> " + AWS_INFO.zone;
    info[8] = "<b>Region :</b> " + AWS_INFO.region;
    info[9] = "<b>Start Time :</b> " + AWS_TimeRange.startdate;
    info[10] = "<b>End Time :</b> " + AWS_TimeRange.enddate;

    var j = 0;
    for (var i = 0; i < AWS_INFO.PARS.length; ++i) {
        var var_code = AWS_INFO.PARS[i];
        var var_name = AWS_INFO.PARS_Info[var_code][0].name;
        var var_height = AWS_INFO.height[var_code][0];

        for (hgt in var_height) {
            var vartxt = var_name + " at " + hgt + "m";
            var stat = AWS_INFO.STATS[var_code][hgt];
            var pars = [];
            for (var s = 0; s < stat.length; ++s) {
                pars[s] = stat[s].name;
            }
            pars = pars.join(", ");
            info[j + 11] = '<b>' + vartxt + " :</b> " + pars;
            j = j + 1;
        }
    }

    return info;
}

function displayMetadata() {
    var infos = getListMetadata();
    var list1 = '';
    for (i = 0; i < 11; i++) {
        list1 += "<li>" + infos[i] + "</li>";
    }
    var list2 = '';
    for (i = 11; i < infos.length; i++) {
        list2 += "<li>" + infos[i] + "</li>";
    }
    $("#awsmetadata1").empty();
    $("#awsmetadata2").empty();
    $("#awsmetadata1").append(list1);
    $("#awsmetadata2").append(list2);
}