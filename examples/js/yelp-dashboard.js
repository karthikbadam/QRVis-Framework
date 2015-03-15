var files = ['data/yelp_training_set_business2.csv', 'data/yelp_training_set_review2.csv'];

// Reviews: user_id, cool, business_id, funny, stars, date, useful, text

// Business: business_id, categories, review_count, name, longitude, stars, latitude

var width = 960,
    height = 600;

var business;

$(document).ready(function () {

    business = new Business();

    //queue for handling file reading
    var q = queue();

    files.forEach(function (filename, i) {

        q.defer(function (callback) {

            d3.csv(filename, function (error, data) {

                data.forEach(function (d) {

                    if (i == 1) {

                        d.user_id = String(d.user_id);
                        d.business_id = String(d.business_id);
                        d.funny = +d.funny;
                        d.stars = +d.stars;
                        d.useful = +d.useful;
                        d.text = String(d.text);
                        d.date = String(d.date);

                        business.addReview(d.business_id, d.text, d.stars);

                    } else if (i == 0) {

                        d.business_id = String(d.business_id);
                        d.categories1 = String(d.categories1);
                        d.categories2 = String(d.categories2);
                        d.review_count = +d.review_count;
                        d.name = String(d.name);
                        d.stars = +d.stars;
                        d.latitude = parseFloat(d.latitude);
                        d.longitude = parseFloat(d.longitude);

                        business.addBusiness(d.business_id, d.latitude, d.longitude, d.categories1, d.categories2, d.stars);

                        console.log("lat: " + d.latitude + ", long: " + d.longitude);
                    }

                });

                callback(null, data);

            });

        });
    });

    q.await(createVisualization);


});

function createVisualization() {

    var formatNumber = d3.format(",.0f");

    var projection = d3.geo.albers()
        .translate([width / 2, height / 2])
        .scale([28000])
        .rotate([108, 0, 0])
        .translate([1900, -2250]);

    var path = d3.geo.path()
        .projection(projection);

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);

    var svg = d3.select("#vizdashboard").append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("data/us-arizona-counties.json", function (error, json) {
        if (error) return console.error(error);

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "#efefef")
            .style("stroke-width", "2")
            .style("stroke", "gray");

        svg.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(business.convertToArray())
            .enter()
            .append("circle")
            .attr("transform", function (d) {
                return "translate(" + projection([d.lon, d.lat]) + ")";

            })
            .attr("r", 5)
            .append("title")
            .text(function (d) {
                return d.name;
            });
        
        svg.append("text").attr("transform", "translate(10,"+ (height  - 30) +")")
            .text("Phoenix, Arizona")
            .style("font-size", "25px");

    });

    //    d3.select(self.frameElement).style("height", height + "px");



}