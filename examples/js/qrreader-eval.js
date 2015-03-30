/**
 * Created by karthik on 1/8/15.
 */

var gCtx = null;
var gCanvas = null;
var c = 0;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;
var captureCanvas = true;

var readQRContent = "";

var start;

var videoSelect = document.querySelector('select#videoSource');

var msg = [];
var vidhtml = '<video id="v" autoplay></video>';
var allLoaded = false;
var counter = 0;
var loader;

var CAPTURE_DELAY = 85;
var DECODE_DELAY = 80;


function gotSources(sourceInfos) {

    for (var i = 0; i !== sourceInfos.length; ++i) {

        var sourceInfo = sourceInfos[i];
        var option = document.createElement('option');

        option.value = sourceInfo.id;

        if (sourceInfo.kind === 'video') {

            option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1);

            videoSelect.appendChild(option);

        } else {

            //console.log('Some other kind of source: ', sourceInfo);

        }
    }
}


function initCanvas(w, h) {

    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);

    //var cropper = new CroppingTool();

    //    gCanvas.addEventListener('mousedown', cropper.start, false);
    //    gCanvas.addEventListener('touchstart', cropper.start, false);
    //
    //    gCanvas.addEventListener('mousemove', cropper.move, false);
    //    gCanvas.addEventListener('touchmove', cropper.move, false);
    //
    //    gCanvas.addEventListener('mouseup', cropper.end, false);
    //    gCanvas.addEventListener('touchend', cropper.end, false);

    $('body').append('<div id="highlightRect" style="background-color: rgba(255, 170, 170, 0.2); border: solid 1px #222; position: absolute; z-index: 100;"></div>');

    $('#highlightRect').width($(document).width()*0.65);
    $('#highlightRect').height($(document).width()*0.65);
    $('#highlightRect').offset({
        left: $(document).width()/4,
        top: $(document).height()/4
    });

    $('#readQR').click(function () {

        start = new Date().getTime();
        decodeQR();

    });
}



function decodeQR() {

    try {

        // single thread programming for wimps
        var decoded = qrcode.decode();


    } catch (e) {
        console.log(e.stack);
        console.log(e.message);
        console.log(e.name);
        console.log(e);
    };

    if (!allLoaded) {

        setTimeout(decodeQR, DECODE_DELAY);
    }
}


function CroppingTool() {

    var _self = this;
    var offset = $('#qr-canvas').offset();
    var offsetx = offset.left;
    var offsety = offset.top;

    this.start = function (event) {

        var x = 0;
        var y = 0;

        event.preventDefault();

        gCtx.fillStyle = "rgba(255, 170, 170, 0.2)";

        if (event.type == "touchstart") {
            x = event.changedTouches[0].clientX - offsetx;
            y = event.changedTouches[0].clientY - offsety;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        _self.startx = x;
        _self.starty = y;

        $('#highlightRect').remove();

        if (!_self.started) {
            $('body').append('<div id="highlightRect" style="background-color: rgba(255, 170, 170, 0.2); border: solid 1px #222; position: absolute; z-index: 100;"></div>');
            $('#highlightRect').width(5);
            $('#highlightRect').height(5);
            $('#highlightRect').offset({
                left: x,
                top: y
            });
        }

        _self.started = true;

    };

    this.move = function (event) {

        event.preventDefault();

        if (_self.started) {
            var x = 0;
            var y = 0;

            if (event.type == "touchmove") {
                x = event.changedTouches[0].clientX;
                y = event.changedTouches[0].clientY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }

            //$('#highlightRect').width(x - _self.startx);
            //$('#highlightRect').height(y - _self.starty);

        }

    };

    this.end = function (event) {

        var x = 0;
        var y = 0;

        event.preventDefault();

        if (event.type == "touchend") {
            x = event.changedTouches[0].clientX - offsetx;
            y = event.changedTouches[0].clientY - offsety;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        if (_self.started) {
            var left = _self.startx;
            var top = _self.starty;

            if (x < _self.startx)
                left = x;

            if (y < _self.starty)
                top = y;

            $('#highlightRect').offset({
                left: left,
                top: top
            });
            $('#highlightRect').width(Math.abs(x - _self.startx));
            $('#highlightRect').height(Math.abs(y - _self.starty));

        }
        _self.started = false;
    };
}


function captureToCanvas() {

    if (gUM) {
        try {
            gCtx.drawImage(v, 0, 0, gCanvas.width, gCanvas.height);
            if (captureCanvas)

                setTimeout(captureToCanvas, CAPTURE_DELAY);

        } catch (e) {
            console.log(e.stack);
            if (captureCanvas)
                setTimeout(captureToCanvas, CAPTURE_DELAY);
        };
    }
}

function read(a) {

    console.log("read frame "+ a);

    captureCanvas = true;

    var message = JSON.parse(a);

    var total = message.t;

    if (msg.length == 0) {

        loader = $("#progressLoader").percentageLoader({
        width: 50,
        height: 50
          });
        for (var i = 0; i < total; i++) {
            msg.push({});
            msg[i].s = "";
            msg[i].filled = false;
        }

    }

    if (!msg[message.l - 1].filled) {
        msg[message.l - 1].i = message.l;
        msg[message.l - 1].s = "got you";
        msg[message.l - 1].filled = true;
    

    var check = true;
    counter = 0;
    for (var i = 0; i < total; i++) {
        if (!msg[i].filled)
            check = false;
        else
            counter++;
    }
    
    console.log((counter / total) + JSON.stringify(msg));
    
    loader.setProgress(counter / total);

    if (check) {
        allLoaded = true;
        captureCanvas = false;
        var messagePassed = "";
        for (var i = 0; i < total; i++) {
            messagePassed = messagePassed + msg[i].s;
        }

        //var message = JSON.stringify(jsonpack.unpack(messagePassed));

        console.log(messagePassed);

        //alert(message);

        var end = new Date().getTime();
        var time = end - start;
        alert('Execution time:' + time);
        console.log('Execution time:' + time);

        readQRContent = message;

        $("#progressLoader").empty();

    }
    }
}

function isCanvasSupported() {

    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));

}

function success(stream) {
    window.stream = stream; // make stream available to console

    if (webkit) {
        v.src = window.webkitURL.createObjectURL(stream);
        v.play();
    } else if (moz) {
        v.mozSrcObject = stream;
        v.play();
    } else
        v.src = stream;

    gUM = true;

    setTimeout(captureToCanvas, CAPTURE_DELAY);

}

function error(error) {
    gUM = false;
    return;
}

function setwebcam() {

    var n = navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v = document.getElementById("v");
    if (!!window.stream) {
        v.src = null;
        window.stream.stop();
    }

    var videoSource = videoSelect.value;

    var constraints = {
        audio: false,
        video: {
            optional: [{
                sourceId: videoSource
            }]
        }
    };

    if (n.getUserMedia) {

        n.getUserMedia(constraints, success, error);

    } else if (n.webkitGetUserMedia) {

        webkit = true;

        n.webkitGetUserMedia(constraints, success, error);

    } else if (n.mozGetUserMedia) {

        moz = true;

        n.mozGetUserMedia(constraints, success, error);

    }

    setTimeout(captureToCanvas, CAPTURE_DELAY);
}

function replaceWebcam() {

    var n = navigator;
    v = document.getElementById("v");
    if (!!window.stream) {

        window.stream.stop();
        v.src = null;
    }

    var videoSource = videoSelect.value;

    var constraints = {
        audio: false,
        video: {
            optional: [{
                sourceId: videoSource
            }]
        }
    };

    if (n.getUserMedia) {

        n.getUserMedia(constraints, success, error);

    } else if (n.webkitGetUserMedia) {

        webkit = true;
        n.webkitGetUserMedia(constraints, success, error);

    } else if (n.mozGetUserMedia) {

        moz = true;
        n.mozGetUserMedia(constraints, success, error);

    }

    setTimeout(captureToCanvas, CAPTURE_DELAY);

}


videoSelect.onchange = replaceWebcam;

function initiate() {
    if (isCanvasSupported() && window.File && window.FileReader && typeof MediaStreamTrack != 'undefined') {

        setwebcam();
        var width = $(document).width();
        var height = $(document).height();

        initCanvas(width, height);
        qrcode.callback = read;
        MediaStreamTrack.getSources(gotSources);
    } else {

        console.log("failed initiation");
    }
}


$(document).ready(function () {

    captureCanvas = true;
    $('#QRcapture').show();
    allLoaded = false;
    counter = 0;
    captureCanvas = true;
    msg = [];
    readQRContent = "";
    initiate();

})