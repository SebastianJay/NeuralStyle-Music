/// Reads the text-based resources on the client-side, removing need for webservice.php

function readTextFile(file, parseFunc, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status === 0)
            {
                var allText = rawFile.responseText;
                var obj = parseFunc(allText);
                callback(obj);
            }
        }
    };
    rawFile.send();
}

function parseFieldText(text) {
    var obj = {};
    var lines = text.split('\n');
    var dx = [];
    var dy = [];
    var lineargs = lines[0].split(',');
    var width = parseInt(lineargs[1], 10);
    var height = parseInt(lineargs[0], 10);
    for (var i = 1; i < lines.length; i++) {
        lineargs = lines[i].split(',');
        var row = [];
        for (var j = 0; j < width; j++) {
            row.push(parseFloat(lineargs[j]));
        }
        if (i <= height) {
            dx.push(row);
        } else {
            dy.push(row);
        }
    }
    obj.dx = dx;
    obj.dy = dy;
    return obj;
}

function parseFreqText(text) {
    var obj = {};
    var lines = text.split('\n');
    var periods = [];
    for (var i = 1; i < lines.length; i++) {
        var lineargs = lines[i].split(',');
        var period = [];
        for (var j = 0; j < 6; j++) {
            period.push(parseFloat(lineargs[j]));
        }
        periods.push(period);
    }
    obj.pps = parseInt(lines[0], 10);
    obj.data = periods;
    return obj;
}
