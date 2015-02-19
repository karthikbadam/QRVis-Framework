qrvis.generate = (function () {


    //takes input ID and number of frames in QR code
    var generator = function (id, parentID, n, data) {


        //split a string
        function stringSplitter(data) {

            var size = Math.floor(data.length / n);
            var returnArray = new Array(n);
            var offset;

            for (var i = 0; i < n; i++) {
                offset = i * size;

                if (i == n - 1)
                    returnArray[i] = data.substr(offset, data.length - offset);
                else
                    returnArray[i] = data.substr(offset, size);
            }

            return returnArray;
        }

        //qrgif
        var gif = new GIF({
            workers: 40,
            quality: 10
        });

        var qrcode = null;

        if (document.getElementById("animCanvas") == null) {
            var qrLeft = -1050;
            var qrTop = 10;

            $("body").append('<div id="animCanvas" class="qrcode" style= "position: absolute; left:' + qrLeft + 'px; top:' + qrTop + 'px;"></div>')

        }

        qrcode = new QRCode(document.getElementById("animCanvas"), {
            width: 300,
            height: 300,
            id: "QRcode"+id
        });

        var qrText = JSON.stringify(JSON.parse(data));

        var packets = stringSplitter(qrText);

        var qrelement = document.getElementById("QRcode"+id);

        for (var i = 0; i < packets.length; i++) {

            var d = {};
            d.l = i + 1;
            d.t = packets.length;
            d.s = packets[i];

            qrcode.makeCode(JSON.stringify(d));

            gif.addFrame(qrelement, {
                "copy": true,
                "delay": 200
            });
            console.log(packets[i]);
        }

        gif.on('finished', function (blob) {


            var gifElement = document.createElement('img');

            gifElement.setAttribute("id", id);

            gifElement.setAttribute("src", URL.createObjectURL(blob));

            var parentElement = document.getElementById(parentID);

            parentElement.appendChild(gifElement);

        });

        gif.render();

    }
    return generator;

})();