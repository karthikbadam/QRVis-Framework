var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall|yeah)$/,
    punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(@|https?:|\/\/)/,
    htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
    matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;

function Business(options) {

    var _self = this;

    _self.allBusiness = [];
    _self.allBusinessObject = {};

}

Business.prototype.addBusiness = function (business_id, lat, lon, category1, category2, rating, name, review_count) {

    var _self = this;

    var business = {};
    business.business_id = business_id;
    business.lat = lat;
    business.lon = lon;
    business.category1 = category1;
    business.category2 = category2;
    business.reviews = [];
    business.stars = [];
    business.rating = rating;
    business.name = name;
    business.review_count = review_count;

    //_self.allBusiness.push(business);
    _self.allBusinessObject[business_id] = business;
}

Business.prototype.addReview = function (business_id, text, stars) {

    var _self = this;

    if (business_id && _self.allBusinessObject[business_id]) {
        _self.allBusinessObject[business_id].reviews.push(text);
        _self.allBusinessObject[business_id].stars.push(stars);
    }

}

Business.prototype.convertToArray = function () {

    var _self = this;
    var keys = Object.keys(_self.allBusinessObject);

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        var b = _self.allBusinessObject[key];
        _self.allBusiness.push(b);

    }


    return _self.allBusiness;
}

Business.prototype.createGeoVisualization = function () {

    var _self = this;

    var width = 960,
        height = 600;

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

    var svg = _self.geosvg = d3.select("#vizdashboard").append("svg")
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
            .selectAll("circle")
            .data(_self.convertToArray())
            .enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("transform", function (d) {
                return "translate(" + projection([d.lon, d.lat]) + ")";

            })
            .attr("r", function (d) {
                return 3 + d.review_count / 30;

            })
            .append("title")
            .text(function (d) {
                return d.name;
            });

        svg.append("text").attr("transform", "translate(10," + (height - 30) + ")")
            .text("Phoenix, Arizona")
            .style("font-size", "25px");

    });


};

Business.prototype.createTreemap = function () {
    var _self = this;

    var width = 450,
        height = 600;

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function (d) {
            return d.value / 10;
        }).sort(function (a, b) {
            return a.value - b.value;
        });

    var div = _self.treemap = d3.select("#vizdashboard").append("div")
        .attr("class", "treemap")
        .style("width", width + "px")
        .style("height", height + "px")

    var parentPosition = $(".treemap").offset();

    var node = div.datum(_self.getCategories())
        .selectAll(".treemap-node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "treemap-node")
        .call(position)
        .text(function (d) {
            return d.children ? null : d.key;
        });


    function position() {
        this.style("left", function (d) {
                return parentPosition.left + 1 + d.x + "px";
            })
            .style("top", function (d) {
                return parentPosition.top + 1 + d.y + "px";
            })
            .style("width", function (d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function (d) {
                return Math.max(0, d.dy - 1) + "px";
            });
    }

};

Business.prototype.getCategories = function () {

    var _self = this;
    _self.allCategories = {};
    _self.allBusinessKeys = Object.keys(_self.allBusinessObject);

    for (var i = 0; i < _self.allBusinessKeys.length; i++) {

        var key = _self.allBusinessKeys[i];

        var category1 = _self.allBusinessObject[key].category1;
        var category2 = _self.allBusinessObject[key].category2;

        if (_self.allCategories[category1]) {

            _self.allCategories[category1] ++;

        } else {

            _self.allCategories[category1] = 1;

        }

        if (_self.allCategories[category2]) {

            _self.allCategories[category2] ++;

        } else {

            _self.allCategories[category2] = 1;

        }
    }


    _self.allCategories = d3.entries(_self.allCategories).sort(function (a, b) {
        return b.value - a.value;
    });;

    return {
        "key": "Categories",
        "children": _self.allCategories
    };

};


Business.prototype.createCompanies = function () {

    var _self = this;

    var width = 1420,
        height = 200;

    var div = _self.reviews = d3.select("#vizdashboard").append("div")
        .attr("class", "companies")
        .style("width", width + "px")
        .style("height", height + "px")

    var nodes = div.selectAll(".companies-node")
        .data(_self.convertToArray())
        .enter().append("div")
        .attr("class", "companies-node");
    
    nodes.append("text")
        .text(function (d) {
            return d.name;
        });
    
    nodes.append("span")
        .attr("class", "stars")
        .append("span")
        .style("width", function (d) {
            return (Math.max(0, (Math.min(5, d.rating))) * 16) + "px" ;
        });
    
    



};