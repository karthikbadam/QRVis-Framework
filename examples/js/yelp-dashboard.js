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

    var rateById = d3.map();


    var projection = d3.geo.albersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);


    var path = d3.geo.path()
        .projection(projection);

}