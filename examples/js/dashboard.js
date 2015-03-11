var content = [
    //'jobs',
    'scatter',
    //'arc'
];

var ved = {
    version: 0.1,
    data: undefined,
    renderType: "svg"
};

$(document).ready(function () {

     $('#outdiv').innerHTML = "";
            $('#QRcapture').hide();
            $('#vizdashboard').show();
    
    
    
    //TODO
    
    
    content.forEach(function (filename) {

        //create a div for the visualization
        $("#vizdashboard").append('<div id="viz-' + filename + '" class= "viz" ></div>');

        var divID = "#viz-" + filename;
        //Vega to create visualization

        d3.xhr("spec/" + filename + ".json", function (error, response) {

            ved.spec = JSON.parse(response.responseText);

            vg.parse.spec(ved.spec, function (chart) {
                d3.select(divID).selectAll("*").remove();
                var view = chart({
                    el: divID,
                    data: ved.data,
                    renderer: ved.renderType
                });

                (ved.view = view).update();

            });

            //add QR code
            //var data = JSON.stringify(JSONC.compress( JSON.parse(response.responseText) ));
            //var data = JSON.stringify(JSON.parse(response.responseText));
            var w = 300;
            var h = 300;

            var spec = JSON.parse(response.responseText);

            if (spec.width) {
                if (spec.width < spec.height)
                   w = spec.width;
                else 
                   w = spec.height;
            }
            
            h = w;

            var data = JSON.stringify(jsonpack.pack(spec));

            qrvis.generate("QRCodesAnim-" + filename, 'viz-' + filename, 10, data, w, h);

            //JSON.stringify(response.responseText);
            console.log(data.length);
        });
    });
});