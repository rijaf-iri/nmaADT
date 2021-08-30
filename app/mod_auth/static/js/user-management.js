$(document).ready(function() {
    $("label[for='userlevel']").append("<sup>(*)</sup>");
    $("#createNewUser").on("click", function() {
        $('a[href="#createUserTab"]').click();
        $(".register-cont #register-userf").remove();
        // if inside html page inside script, we can do this
        // use this:    "{{ url_for('auth.createUser_page') }}"
        // if loaded from js file, we need to use JSGlue
        // use this:    Flask.url_for('auth.createUser_page')
        // both inside html and loaded from js, we can use app route
        // use this:    '/createUser' 
        $.ajax('/createUser').done(function(reply) {
            var jQueryObject = $.parseHTML(reply);
            var html = $(jQueryObject).find("#register-userf");
            $(".register-cont").html(html).appendTo($("#createUserTab"));
            $("label[for='userlevel']").append("<sup>(*)</sup>");
        });
    });
    //
    var jsObj = ['username', 'userlevel', 'email', 'fullname', 'institution'];
    var colHeader = ["Username", "Access Level", "Email", "Full Name", "Institution"];
    //
    $("#displayUsers").on("click", function() {
        $('a[href="#dispUserTab"]').click();
        // if inside html page inside script, we can do this
        // url: "{{ url_for('auth.getListOfUsers') }}",
        // if loaded from js file, we need to use JSGlue
        // url: Flask.url_for('auth.getListOfUsers'), 
        // both inside html and loaded from js file, we can use app route
        // url: '/getUsers', 
        $.ajax({
            url: '/getUsers',
            dataType: "json",
            success: function(json) {
                $('.jsonTable').remove();
                var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
                var head = $('<tr>');
                for (i = 0; i < colHeader.length; i++) {
                    var col = $('<th>').text(colHeader[i]);
                    head.append(col);
                }
                table.append(head);
                for (i = 0; i < json.length; i++) {
                    var row = $('<tr>');
                    for (var j = 0; j < jsObj.length; j++) {
                        var col = $('<td>').text(json[i][jsObj[j]]);
                        row.append(col);
                    }
                    table.append(row);
                }
                $("#idTable").append(table);
            }
        });
    });
    //
    $('#btn-submit-rm').click(function() {
        var username = $('#rmUsername').val();
        $('#rmUserTable').empty();
        $.ajax({
            url: '/removeUser',
            data: { username: username },
            type: 'POST',
            success: function(json) {
                json = JSON.parse(json);
                if (json.fullname == 'null') {
                    $('#rmUserTable').css("background-color", "red");
                    $("#rmUserTable").html("<p>User: " + username + " does not exist</p>");
                } else {
                    json = json[0];
                    $('#rmUserTable').css("background-color", "transparent");
                    $("#rmUserTable").append("<p><strong>User removed successfully from database</strong></p>");
                    var table = $('<table>').addClass('remove-form');
                    for (i = 0; i < jsObj.length; i++) {
                        var row = $('<tr>');
                        var col1 = $('<td>').text(colHeader[i] + "  :").css({ "font-weight": "bold", "text-align": "right" });
                        row.append(col1);
                        var col2 = $('<td>').text(json[jsObj[i]]).css("padding-left", "10px");
                        row.append(col2);
                        table.append(row);
                    }
                    $("#rmUserTable").append(table);
                }
            },
            error: function(request, status, error) {
                $('#rmUserTable').css("background-color", "red");
                $("#rmUserTable").html("Error: " + request + status + error);
            }
        });
    });
});