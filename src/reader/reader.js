
var STOP_READING = false; 

qrvis.reader = (function () {

    var read = function (callback) {

        var cb = function (d) {
            callback(d);
        };

        qrcode.callback = cb;

        function decodeQR() {

            try {

                var decoded = qrcode.decode();

            } catch (e) {

                console.log(e);

            };
            
            if (!STOP_READING) {
                setTimeout(decodeQR, 170 );
            }
        }
        
        STOP_READING = false; 
        
        decodeQR(); 
    };

    return read;

})();

qrvis.reader.interrupt = function () {

    STOP_READING = true;     

}

