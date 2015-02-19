var content = [
    'jobs',
    'scatter', 
    'arc'
];

var ved = {
    version: 0.1,
    data: undefined,
    renderType: "svg"
};

$(document).ready(function () {

    content.forEach(function (filename) {

        //create a div for the visualization
        $("body").append('<div id="viz-' + filename + '" class= "viz" ></div>');

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

            var data = JSON.stringify(jsonpack.pack(JSON.parse(response.responseText)));

            qrvis.generate("QRCodesAnim-" + filename, 'viz-' + filename, 10, data);

            //JSON.stringify(response.responseText);
            console.log(data.length);
        });
    });
});