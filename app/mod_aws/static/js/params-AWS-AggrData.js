function setAWSAggrDataTime() {
    var label = ['Year', 'Mon', 'Dek', 'Pen', 'Day', 'Hour'];
    var pname = ['year', 'month', 'dekad', 'pentad', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2, #minute3').hide();
    //
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
    var vhour = daty.getHours();
    $("#hour1").val("00");
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
    var vday = daty.getDate();
    $("#day1").val("01");
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
    var vmon = daty.getMonth() + 1;
    $("#month1").val("01");
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year1").val(2020);
    $("#year2, #year3").val(thisYear);
    //
    //
    for (var i = 1; i <= 3; ++i) {
        $('#dekad1, #dekad2, #dekad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#dekad1").val("1");
    $("#dekad2, #dekad3").val(daty.getDekad());
    //
    for (var i = 1; i <= 6; ++i) {
        $('#pentad1, #pentad2, #pentad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#pentad1").val("1");
    $("#pentad2, #pentad3").val(daty.getPentad());
    //
    $("#timestepDispTS").change(function() {
        for (var c = 3; c < 7; c++) {
            $(".aws-select-time td:nth-child(" + c + ")").hide();
        }
        var timestep = $(this).val();
        if (timestep == "hourly") {
            $(".aws-select-time td:nth-child(6)").show();
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "daily") {
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "pentad") {
            $(".aws-select-time td:nth-child(4)").show();
        } else if (timestep == "dekadal") {
            $(".aws-select-time td:nth-child(3)").show();
        } else {
            for (var c = 3; c < 7; c++) {
                $(".aws-select-time td:nth-child(" + c + ")").hide();
            }
        }
    });
    $("#timestepDispTS").trigger("change");
}

function setAWSAggrSpVariable() {
    $('#awsSpVar').empty();
    var stat_names = ['', 'avg', 'min', 'max'];

    $.each(AWS_dataAggrVarObj, function() {
        if (this.var_code == 5) {
            var txt = this.var_name + " @ " + this.height + "m" + " (sum)";
            var val = this.var_code + "_" + this.height + "_" + 4;
            $('#awsSpVar').append(
                $("<option>").text(txt).val(val)
            );
        } else {
            for (var s = 1; s < 4; s++) {
                var txt = this.var_name + " @ " + this.height + "m" +
                    " (" + stat_names[s] + ")";
                var val = this.var_code + "_" + this.height + "_" + s;
                $('#awsSpVar').append(
                    $("<option>").text(txt).val(val)
                );
            }
        }
    });
    $("#awsSpVar").val("5_1_4");
}

function setAWSAggrTsVariableSel() {
    $.each(AWS_dataAggrVarObj, function() {
        var text = this.var_name + " @ " + this.height + "m";
        var val = this.var_code + "_" + this.height;
        $('#awsObsVar').append(
            $("<option>").text(text).val(val)
        );
    });

    // var firstSel = $("#awsObsVar option:first").val();
    var firstSel = "5_1";
    $("#awsObsVar").val(firstSel);
    setAWSParamSelect1(firstSel);
}

function setAWSAggrTsVariable() {
    $.each(AWS_JSON, function() {
        var text = this.name + " - " + this.id + " - " + this.network;
        var val = this.network_code + "_" + this.id;
        $('#stationDispAWS').append(
            $("<option>").text(text).val(val)
        );
    });

    $('#stationDispAWS option[value=2_SHADDI15]').attr('selected', true);
    AWS_INFO = getAWSInfos('2_SHADDI15');

    setAWSVariableSelect1();
    setAWSParamSelect1("5_1");
}

//////////

function selectAWS2DispTS(json, selAWS) {
    var divmodal = $('<div>').addClass('modal-dialog');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    $(divhead).css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })
    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal',
        click: () => {
            selAWSTS = selAWS;
        }
    }).appendTo(divhead);

    $("<h4>").text("AWS Selection").appendTo(divhead);

    //////
    // body
    var divSelect = $('<div>').addClass('div-modal-select');
    var divLeft = $('<div>').css({
        'text-align': 'right',
        // 'background-color': 'red',
    });
    var divRight = $('<div>').css({
        'text-align': 'left',
        // 'background-color': 'blue',
    });
    var divCenter = $('<div>').css({
        'text-align': 'center',
        // 'background-color': 'green',
    });

    var select_left = $('<select>').appendTo(divLeft);
    select_left.attr("multiple", "multiple");
    select_left.attr("size", 20);
    select_left.addClass('left-select');
    select_left.css('width', '250px');

    $.each(json, function() {
        var text = this.name + " - " + this.id + " - " + this.network;
        var val = this.network_code + "_" + this.id;
        select_left.append($("<option>").val(val).text(text));
    });

    //
    var select_right = $('<select>').appendTo(divRight);
    select_right.attr("multiple", "multiple");
    select_right.attr("size", 20);
    select_right.css('width', '250px');

    if (selAWS.length > 0) {
        for (var i = 0; i < selAWS.length; ++i) {
            var ix = json.map(x => x.network_code + "_" + x.id).indexOf(selAWS[i]);
            var obj = json[ix];
            var text = obj.name + " - " + obj.id + " - " + obj.network;
            var val = obj.network_code + "_" + obj.id;
            select_right.append($("<option>").val(val).text(text));
        }
    }

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' >> ',
        click: () => {
            var sel_aws_val = select_left.val();
            if (sel_aws_val.length == 0) {
                return false;
            }
            var sel_aws_txt = $('.left-select option:selected').toArray().map(item => item.text);

            for (var i = 0; i < sel_aws_val.length; ++i) {
                if (selAWS.includes(sel_aws_val[i])) {
                    continue;
                } else {
                    selAWS.push(sel_aws_val[i]);
                    select_right.append($("<option>").val(sel_aws_val[i]).text(sel_aws_txt[i]));
                }
            }
        }
    }).appendTo(divCenter);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' << ',
        click: () => {
            var sel_aws_val = select_right.val();
            if (sel_aws_val.length == 0) {
                return false;
            }

            for (var i = 0; i < sel_aws_val.length; ++i) {
                select_right.find('[value="' + sel_aws_val[i] + '"]').remove();
                var ix = selAWS.indexOf(sel_aws_val[i]);
                if (ix > -1) {
                    selAWS.splice(ix, 1);
                }
            }
        }
    }).appendTo(divCenter);

    //////

    divSelect.append(divLeft);
    divSelect.append(divCenter);
    divSelect.append(divRight);
    divbody.append(divSelect);

    //////

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal',
        click: () => {
            selAWSTS = selAWS;
        }
    }).appendTo(divfoot);

    // 
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////

function selectDataAWSSP(json, selAWS) {
    var aws_list = json.data.map(x => x.network_code + "_" + x.id);
    var aws_ix = [];
    for (var i = 0; i < selAWS.length; i++) {
        aws_ix.push(aws_list.indexOf(selAWS[i]));
    }
    aws_ix = aws_ix.filter(x => x !== -1);

    var aws_sel = aws_ix.map(i => json.data[i]);
    json.data = aws_sel;

    var var_col = new Object();
    for (x in json.color) {
        var_col[x] = aws_ix.map(i => json.color[x][i]);
    }
    json.color = var_col;

    return json;
}

//////////

function selectAWS2DispSP(json, selAWS, vars) {
    var divmodal = $('<div>').addClass('modal-dialog');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    $(divhead).css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })
    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal',
        click: () => {
            if (selAWS.length > 0) {
                json = selectDataAWSSP(json, selAWS);
            }
            leaflet_Map_dataAggrAWS(vars, json);
            selAWSSP = selAWS;
        }
    }).appendTo(divhead);

    $("<h4>").text("AWS Selection").appendTo(divhead);

    //////
    // body
    var divSelect = $('<div>').addClass('div-modal-select');
    var divLeft = $('<div>').css({
        'text-align': 'right',
        // 'background-color': 'red',
    });
    var divRight = $('<div>').css({
        'text-align': 'left',
        // 'background-color': 'blue',
    });
    var divCenter = $('<div>').css({
        'text-align': 'center',
        // 'background-color': 'green',
    });

    var select_left = $('<select>').appendTo(divLeft);
    select_left.attr("multiple", "multiple");
    select_left.attr("size", 20);
    select_left.addClass('left-select');
    select_left.css('width', '250px');

    $.each(json.data, function() {
        var text = this.name + " - " + this.id + " - " + this.network;
        var val = this.network_code + "_" + this.id;
        select_left.append($("<option>").val(val).text(text));
    });

    //
    var select_right = $('<select>').appendTo(divRight);
    select_right.attr("multiple", "multiple");
    select_right.attr("size", 20);
    select_right.css('width', '250px');

    if (selAWS.length > 0) {
        for (var i = 0; i < selAWS.length; ++i) {
            var ix = json.data.map(x => x.network_code + "_" + x.id).indexOf(selAWS[i]);
            if (ix === -1) continue;
            var obj = json.data[ix];
            var text = obj.name + " - " + obj.id + " - " + obj.network;
            var val = obj.network_code + "_" + obj.id;
            select_right.append($("<option>").val(val).text(text));
        }
    }

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' >> ',
        click: () => {
            var sel_aws_val = select_left.val();
            if (sel_aws_val.length == 0) {
                return false;
            }
            var sel_aws_txt = $('.left-select option:selected').toArray().map(item => item.text);

            for (var i = 0; i < sel_aws_val.length; ++i) {
                if (selAWS.includes(sel_aws_val[i])) {
                    continue;
                } else {
                    selAWS.push(sel_aws_val[i]);
                    select_right.append($("<option>").val(sel_aws_val[i]).text(sel_aws_txt[i]));
                }
            }
        }
    }).appendTo(divCenter);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: ' << ',
        click: () => {
            var sel_aws_val = select_right.val();
            if (sel_aws_val.length == 0) {
                return false;
            }

            for (var i = 0; i < sel_aws_val.length; ++i) {
                select_right.find('[value="' + sel_aws_val[i] + '"]').remove();
                var ix = selAWS.indexOf(sel_aws_val[i]);
                if (ix > -1) {
                    selAWS.splice(ix, 1);
                }
            }
        }
    }).appendTo(divCenter);

    //////

    divSelect.append(divLeft);
    divSelect.append(divCenter);
    divSelect.append(divRight);
    divbody.append(divSelect);

    //////

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal',
        click: () => {
            if (selAWS.length > 0) {
                json = selectDataAWSSP(json, selAWS);
            }
            leaflet_Map_dataAggrAWS(vars, json);
            selAWSSP = selAWS;
        }
    }).appendTo(divfoot);

    // 
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////

function leaflet_Map_dataAggrAWS(pars, json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });

    ////////
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
        if (don[pars] == undefined) {
            return;
        }

        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");
        $('<span>').addClass("pin-label")
            .html(Math.round(don[pars]))
            .appendTo(divIco);
        divIconHtml.append(divIco);

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.name + '<br>' + '<b>NETWORK : </b>' + don.network;
        var tablePopup = awsSpatialbindPopup_Aggr(don, json.date, AWS_dataAggrVarObj, 'Date');

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
            .bindPopup(tablePopup.prop('outerHTML'))
            .bindTooltip(txttip, text2Op)
            .addTo(mymap);
        mymarkersBE.push(marker);
        // 
        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[pars][ix]);
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
    var vkey = getVarNameColorKey(pars);
    $('#colKeyMapVar').empty();

    var var_sp = pars.split('_');
    var pars1 = var_sp[0] + "_" + var_sp[1];
    var ix = AWS_dataAggrVarObj.map(x => x.var_code + '_' + x.height).indexOf(pars1);
    var titre = AWS_dataAggrVarObj[ix].var_name + ' (' + AWS_dataAggrVarObj[ix].var_units + ')';

    $('<p>').html(titre).css({
        'margin-top': '1px',
        'margin-bottom': '2px',
        'font-size': '10'
    }).appendTo('#colKeyMapVar');
    $('#colKeyMapVar').append(createColorKeyH(json.key[vkey]));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '35px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);
}