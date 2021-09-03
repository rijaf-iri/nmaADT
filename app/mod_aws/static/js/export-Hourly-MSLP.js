$("#downMSLP").on("click", () => {
    var data = {
        time: formatDateMap1Hour()
    };
    var url = '/downHourlyMSLP' + '?' + encodeQueryData(data);

    $("#downMSLP").attr("href", url).attr('target', '_blank');
});