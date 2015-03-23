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

    _self.currentTreemapSelection = [];

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

    _self.allBusiness.sort(function (a, b) {
        return b.rating - a.rating;
    });


    return _self.allBusiness;
}

Business.prototype.createGeoVisualization = function () {

    var _self = this;

    var width = 800,
        height = 600;

    var qrcode = new QRVis({
        parentId: "geosvgDiv"
    });

    /* adding dimensions */
    qrcode.addDimensions(width, height, "map");

    var lonLeft = -112.828974;
    var lonRight = -111.338143;

    var latTop = 32.8773814;
    var latBottom = 33.973909;

    var properties = {
        type: "geopath",
        projection: "albersUsa",
    };

    var scale = 60 * height / (latBottom - latTop);

    var formatNumber = d3.format(",.0f");

    var projection = _self.projection = d3.geo.albersUsa()
        .scale([scale])
        .translate([0, 0]);

    var trans = projection([lonLeft, latBottom]);

    projection.translate([-1 * trans[0], -1 * trans[1]]);

    var path = d3.geo.path()
        .projection(projection);

    var radius = d3.scale.sqrt()
        .domain([0, 1e6])
        .range([0, 15]);
    
    d3.select("#vizdashboard").append("div")
        .attr("id", "geosvgDiv");

    var svg = _self.geosvg = d3.select("#geosvgDiv").append("svg")
        .attr("id", "geosvg")
        .attr("class", "geosvgClass") 
        .attr("width", width)
        .attr("height", height);

    var url = "data/us-arizona-counties.json";


    /* add map data */
    qrcode.addData("counties", url, properties);

    /* add marker data */
    qrcode.addData("business", "allBusiness", {});

    d3.json(url, function (error, json) {
        if (error) return console.error(error);

        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "transparent")
            .style("stroke-width", "2")
            .style("stroke", "gray");

        // add path marks 
        qrcode.addMarks("path", {
            data: "counties"
        }, "big", {
            path: {
                field: "path"
            }
        }, {}, {});

        var circleNodes = svg
            .selectAll("g")
            .data(_self.convertToArray())
            .enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + projection([d.lon, d.lat]) + ")";

            });

        circleNodes.append("circle")
            .attr("class", "bubble")
            .attr("r", function (d) {
                return 3 + d.review_count / 30;

            })
            .style("fill-opacity", 0.05)
            .style("fill", "brown")
            .append("title")
            .text(function (d) {
                return d.name;
            });
        

        circleNodes.append("text")
            .attr("dx", function (d) {
                return 10;
            })
            .attr("dy", function (d) {
                return 10;
            })
            .style({"fill-opacity": 0.0001,
                    "fill": "black",
                    "stroke": "0px", 
                    "pointer-events": "none", 
                    "font-size": "10px"})
            .text(function (d) {
                 return d.name;
            });

        // add circles 
        qrcode.addMarks("circle", {
            data: "business"
        }, "big", {
            transform: {
                scale: "projection",
                "field": "[d.lon, d.lat]"
            },
            radius: {
                field: "3 + d.review_count/30"
            }
        }, {}, {});

        svg.append("text").attr("transform", "translate(10," + (height - 30) + ")")
            .text("Phoenix, Arizona")
            .style("font-size", "25px");

        qrcode.makeQR();
    });

    _self.geomapQR = qrcode;


};

Business.prototype.createTreemap = function () {
    var _self = this;

    var width = 610,
        height = 600;


    var qrcode = new QRVis({
        parentId: "treemapViz"
    });


    /* adding dimensions */
    qrcode.addDimensions(width, height, "treemap", 0.7);

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function (d) {
            return Math.pow(d.value, 0.75);
        }).sort(function (a, b) {
            return a.value - b.value;
        });

    qrcode.addScales("treemap", "treemap", "[width, height]", "d.value");

    var div = _self.treemap = d3.select("#vizdashboard").append("div")
        .attr("class", "treemap")
        .attr("id", "treemapViz")
        .style("width", width + "px")
        .style("height", height + "px")

    var s = new selectionTool("treemapViz");

    div.on("mousedown", s.start);
    div.on("mousemove", s.move);
    div.on("mouseup", s.end);

    //need to add interaction to the QR code
    //associate it with an update

    var parentPosition = $(".treemap").offset();

    var nodes = div.datum(_self.getCategories())
        .selectAll(".treemap-node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "treemap-node")
        .call(position)
        .text(function (d) {
            return d.children ? null : d.key;
        });

    qrcode.addMarks("div", "categories", "big", {
        style: {
            left: "d.x",
            top: "d.y",
            width: "Math.max(0, d.dx-1)",
            height: "Math.max(0, d.dy-1)"
        }
    }, {}, {});

    s.setNodes(nodes);

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

    s.onEnd(function (left, top, width, height) {

        var selections = [];

        nodes.each(function (d) {
            var nodeLeft = parentPosition.left + 1 + d.x;
            var nodeTop = parentPosition.top + 1 + d.y;
            var nodeWidth = Math.max(0, d.dx - 1);
            var nodeHeight = Math.max(0, d.dy - 1);

            if (d.key!="Categories" && (nodeLeft > left && nodeTop > top) && (nodeLeft + nodeWidth < left + width && nodeTop + nodeHeight < top + height)) {

                selections.push(d.key);
                d3.select(this).attr("class", "treemap-node-selected");


            } else if (d.key!="Categories" && nodeLeft < left + width && nodeLeft + nodeWidth > left &&
                nodeTop < top + height && nodeTop + nodeHeight > top) {

                selections.push(d.key);
                
                d3.select(this).attr("class", "treemap-node-selected");

            } else {
                d3.select(this).attr("class", "treemap-node");
            }

        });


        if (selections.length > 0) {
            _self.currentTreemapSelection = selections;
            _self.updateViewsTreemap(selections);
        }
    });

    qrcode.makeQR();

    _self.treemapQR = qrcode;

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

        //        if (_self.allCategories[category2]) {
        //
        //            _self.allCategories[category2] ++;
        //
        //        } else {
        //
        //            _self.allCategories[category2] = 1;
        //
        //        }
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

    var width = 1430,
        height = 200;


    var qrcode = new QRVis({
        parentId: "companiesDiv"
    });


    /* adding dimensions */
    qrcode.addDimensions(width, height, "companies", 0.7);

    var div = _self.reviews = d3.select("#vizdashboard").append("div")
        .attr("class", "companies")
        .attr("id", "companiesDiv")
        .style("width", width + "px")
        .style("height", height + "px")

    var nodes = div.selectAll(".companies-node")
        .data(_self.convertToArray())
        .enter().append("div")
        .attr("class", "companies-node");

    qrcode.addMarks("div", "allBusiness", "big", {
        style: {
            class: "companies-node"
        }
    }, {}, {});

    nodes.append("p")
        .text(function (d) {
            return d.name;
        }).style({
            "height": "14px",
            "text-overflow": "ellipsis",
            "margin": "0px",
            "overflow": "hidden"
        });

    qrcode.addMarks("text", "", "big", {
        text: {
            text: "d.name"
        }
    }, {}, {});

    nodes.append("span")
        .attr("class", "stars")
        .append("span")
        .style("width", function (d) {
            return (Math.max(0, (Math.min(5, d.rating))) * 16) + "px";
        });

    qrcode.addMarks("span", "", "big", {
        style: {
            class: "stars"
        }
    }, {}, {});

    qrcode.addMarks("span", "", "big", {
        style: {
            width: "Math.max(0, (Math.min(5, d.rating))) * 16"
        }
    }, {}, {});

    qrcode.makeQR();

    _self.companyQR = qrcode;

};



Business.prototype.getWords = function (selection) {

    var _self = this;

    _self.tags = {};


    for (var i = 0; i < _self.allBusinessKeys.length; i++) {

        var key = _self.allBusinessKeys[i];

        if (_self.allBusinessObject[key].reviews.length < 2)
            continue;

        for (var j = 0; j < _self.allBusinessObject[key].reviews.length; j++) {
            var review = _self.allBusinessObject[key].reviews[j];

            var words = review.split(wordSeparators);

            words.forEach(function (word, i) {
                word = word.replace(punctuation, "");
                word = word.toLowerCase();

                word = word.replace(/[0-9]/g, '');

                if (word.length == 0)
                    return;


                if (stopWords.test(word)) return;

                if (word.length <= 2) return;

                if (_self.tags[word]) {

                    _self.tags[word] ++;

                } else {

                    _self.tags[word] = 1;

                }

            });
        }
    }


    sortedTags = d3.entries(_self.tags)
        .sort(function (a, b) {
            return b.value - a.value;
        });

    _self.wordMin = sortedTags[sortedTags.length - 1].value || 1;
    _self.wordMax = sortedTags[0].value;

    _self.tags = d3.entries(_self.tags);

}

Business.prototype.updateViewsTreemap = function (selection) {

    var _self = this;

    _self.dataSelected = [];
    //get business object 

    for (var i = 0; i < _self.allBusiness.length; i++) {
        var d = _self.allBusiness[i];

        if (selection.indexOf(d.category1) >= 0 || selection.indexOf(d.category2) >= 0) {
            _self.dataSelected.push(d);
        }
    }

    var companySelect = _self.reviews.selectAll(".companies-node");
    companySelect.remove();

    var nodes = _self.reviews.selectAll(".companies-node")
        .data(_self.dataSelected)
        .enter().append("div")
        .attr("class", "companies-node");

    nodes.append("p")
        .text(function (d) {
            return d.name;
        }).style({
            "height": "14px",
            "text-overflow": "ellipsis",
            "margin": "0px",
            "overflow": "hidden"
        });

    nodes.append("span")
        .attr("class", "stars")
        .append("span")
        .style("width", function (d) {
            return (Math.max(0, (Math.min(5, d.rating))) * 16) + "px";
        });

        
    _self.geosvg
        .selectAll("circle")
        .style("fill-opacity", 0.001);
    
    _self.geosvg
        .selectAll("text")
        .style("fill-opacity", 0.001);

    _self.geosvg
        .selectAll("circle")
        .data(_self.dataSelected)
        .style("fill-opacity", 0.3);
    
    
    _self.geosvg
        .selectAll("text")
        .data(_self.dataSelected)
        .style({
            "fill-opacity": 0.001
    });

    // update QR
    _self.geomapQR.addSelection(_self.currentTreemapSelection);
    _self.geomapQR.makeQR();

}

function selectionTool(elementId) {
    var _self = this;
    var offset = $("#" + elementId).offset();
    var offsetx = offset.left;
    var offsety = offset.top;

    this.setNodes = function (nodes) {

        _self.nodes = nodes;

    };

    this.start = function () {

        var event = d3.event;

        var x = 0;
        var y = 0;

        event.preventDefault();

        if (event.type == "touchstart") {
            x = event.changedTouches[0].clientX;
            y = event.changedTouches[0].clientY;

        } else {

            x = event.clientX;
            y = event.clientY;
        }

        _self.startx = x;
        _self.starty = y;

        $('#highlightRect').remove();

        if (!_self.started) {

            d3.select("#" + elementId).append("div")
                .attr("id", "highlightRect")
                .style({
                    width: 5 + "px",
                    height: 5 + "px",
                    left: x + "px",
                    top: y + "px",
                    border: "solid 1px #222",
                    "background-color": "rgba(255, 170, 170, 0.2)",
                    position: "absolute"
                });
        }

        _self.started = true;
    };

    this.move = function () {
        var event = d3.event;

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

            var left = _self.startx;
            var top = _self.starty;

            if (x < _self.startx)
                left = x;

            if (y < _self.starty)
                top = y;


            d3.select("#highlightRect")
                .style({
                    width: Math.abs(x - _self.startx) + "px",
                    height: Math.abs(y - _self.starty) + "px",
                    left: left + "px",
                    top: top + "px",
                    border: "solid 1px #222",
                    "background-color": "rgba(255, 170, 170, 0.2)",
                });

        }

    };

    this.end = function () {

        var event = d3.event;

        var x = 0;
        var y = 0;

        var left = _self.startx;
        var top = _self.starty;

        event.preventDefault();

        if (event.type == "touchend") {
            x = event.changedTouches[0].clientX - offsetx;
            y = event.changedTouches[0].clientY - offsety;
        } else {
            x = event.clientX;
            y = event.clientY;
        }

        if (_self.started) {

            if (x < _self.startx)
                left = x;

            if (y < _self.starty)
                top = y;


            d3.select("#highlightRect")
                .style({
                    width: Math.abs(x - _self.startx) + "px",
                    height: Math.abs(y - _self.starty) + "px",
                    left: left + "px",
                    top: top + "px",
                    border: "solid 1px #222",
                    "background-color": "rgba(255, 170, 170, 0.2)",
                });


        }

        _self.started = false;

        var width = Math.abs(x - _self.startx);
        var height = Math.abs(y - _self.starty);

        _self.left = left;
        _self.top = top;
        _self.width = width;
        _self.height = height;

        _self.endSelection(_self.left, _self.top, _self.width, _self.height);

        d3.select("#highlightRect").remove();
    };

    this.onEnd = function (endSelection) {

        _self.endSelection = endSelection;
    };

};