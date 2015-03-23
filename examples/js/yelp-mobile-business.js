var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall|yeah)$/,
    punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(@|https?:|\/\/)/,
    htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
    matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;

var topCategoryList = ["Food", "Hotels", "Bars", "Active Life"];

var divergingColorScale = ["rgba(202,0,32, 0.7)",
"rgba(244, 165, 130, 0.7)",
"rgba(247, 247, 247, 0.7)",
"rgba(146, 197, 222, 0.7)",
"rgba(5, 113, 176, 0.7)",
"rgba(10, 57, 107, 0.7)"];

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

    _self.allBusiness.sort(function (a, b) {
        return b.rating - a.rating;
    });


    return _self.allBusiness;
}

Business.prototype.createGeoVisualization = function (content) {

    var _self = this;

    //    qrcontent = qrcontent.replace(/\\"/gi, "");
    //
    //    var content = JSON.parse(qrcontent);

    // Transformation 
    var transformation = 3;

    var lonLeft = -112.828974;
    var lonRight = -111.338143;

    var latTop = 32.8773814;
    var latBottom = 33.973909;

    var width = content.width * $(document).width(),
        height = content.height * $(document).height();


    if (content.aspectRatio) {
        height = width / content.aspectRatio;
    }

    var projection = _self.projection;
    var path = _self.path;

    var data = content.data[0];

    var scale = 60 * height / (latBottom - latTop);

    var formatNumber = d3.format(",.0f");

    projection = _self.projection = d3.geo.albersUsa()
        .scale([scale])
        .translate([0, 0]);

    var trans = projection([lonLeft, latBottom]);

    projection.translate([-1 * trans[0], -1 * trans[1]]);

    path = _self.path = d3.geo.path()
        .projection(projection);

    _self.url = data.filename;

    if (_self.allBusiness.length == 0) {
        _self.allBusiness = _self.convertToArray();
    }

    var selection = content.selections;

    if (content.selections && content.selections > 0) {
        topCategoryList = content.selections.length >= 4 ? content.selections.slice(0, 4) : content.selections;
    }

    for (var i = 1; i < content.data.length; i++) {

        $("#geosvg").remove();

        var svg = _self.geosvg = d3.select("#vizdashboard").append("svg")
            .attr("id", "geosvg")
            .attr("width", width)
            .attr("height", height);


        d3.json(_self.url, function (error, json) {
            if (error) return console.error(error);

            var marks = content.marks;

            var type = marks[0].type;
            var field = marks[0].properties.enter["path"].field;

            svg.selectAll(type)
                .data(json.features)
                .enter()
                .append(type)
                .attr("d", eval(field))
                .style("fill", "white")
                .style("stroke-width", "2")
                .style("stroke", "gray");

            type = marks[1].type;
            var scale = marks[1].properties.enter["transform"].scale;
            var field1 = marks[1].properties.enter["transform"].field;
            var field2 = marks[1].properties.enter["radius"].field;

            svg.append("g")
                .selectAll(type)
                .data(_self.allBusiness)
                .enter()
                .append(type)
                .attr("class", "bubble")
                .attr("transform", function (d) {
                    return "translate(" + eval(scale + "(" + field1 + ")") + ")";

                })
                .style("fill-opacity", function (d) {

                    if (selection.indexOf(d.category1) < 0) {
                        return 0;
                    }

                    if (transformation == 3) {
                        var opacity = d.rating / 5 * 0.2 + 0.001;
                        return opacity;
                    }

                    return 0.001;

                })
                .style("fill", function (d) {

                    if (transformation == 3) {
                        if (topCategoryList.indexOf(d.category1) >= 0) {
                            return colorScale(d.category1);
                        }
                    }

                    return "brown";
                })
                .attr("r", function (d) {
                    return eval(field2);

                })
                .append("title")
                .text(function (d) {
                    return d.name;
                })

        });

        svg.append("text").attr("transform", "translate(10," + (height - 30) + ")")
            .text("Phoenix, Arizona")
            .style("font-size", "25px");
    }

};

Business.prototype.createTreemap = function (content) {

    var _self = this;
    
    var transform = 3; 

    var width = content.width * $(document).width(),
        height = content.height * $(document).height();


    if (content.aspectRatio) {
        height = width / content.aspectRatio;
    }

    var scale = content.scales[0];

    var treemap = d3.layout.treemap()
        .size(eval(scale.domain))
        .sticky(true)
        .value(function (d) {
            return eval(scale.range) / 10;
        }).sort(function (a, b) {
            return a.value - b.value;
        });

    $("#treemapViz").remove();
    $(".treemap-node").remove();

    var div = _self.treemap = d3.select("#vizdashboard").append("div")
        .attr("class", "treemap")
        .attr("id", "treemapViz")
        .style("width", width + "px")
        .style("height", height + "px")

    var s = new selectionTool("treemapViz");

    div.on("mousedown", s.start);
    div.on("mousemove", s.move);
    div.on("mouseup", s.end);

    var parentPosition = $("#treemapViz").offset();

    var nodes = div.datum(_self.getCategories())
        .selectAll(".treemap-node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "treemap-node")
        .style("background-color", function (d) {
            if (transform == 3 && _self.allCategories[d.key] && _self.allCategories[d.key] > 0) {
                return divergingColorScale[Math.floor(_self.categoryRatings[d.key]/_self.allCategories[d.key])];
            }

            return "white";
        })
        .call(position)
        .text(function (d) {
            return d.children ? null : d.key;
        });

    //_self.categoryRatings

    function position() {

        var marks = content.marks[0];

        var markStyle = marks.properties.enter.style;

        this.style("left", function (d) {
                return parentPosition.left + 1 + eval(markStyle.left) + "px";
            })
            .style("top", function (d) {
                return parentPosition.top + 1 + eval(markStyle.top) + "px";
            })
            .style("width", function (d) {
                return eval(markStyle.width) + "px";
            })
            .style("height", function (d) {
                return eval(markStyle.height) + "px";
            });
    }

    s.setNodes(nodes);

    s.onEnd(function (left, top, width, height) {

        var selections = [];

        nodes.each(function (d) {
            var nodeLeft = parentPosition.left + 1 + d.x;
            var nodeTop = parentPosition.top + 1 + d.y;
            var nodeWidth = Math.max(0, d.dx - 1);
            var nodeHeight = Math.max(0, d.dy - 1);

            if ((nodeLeft > left && nodeTop > top) && (nodeLeft + nodeWidth < left + width && nodeTop + nodeHeight < top + height)) {

                selections.push(d.key);
                d3.select(this).attr("class", "treemap-node-selected");


            } else if (nodeLeft < left + width && nodeLeft + nodeWidth > left &&
                nodeTop < top + height && nodeTop + nodeHeight > top) {

                selections.push(d.key);

                d3.select(this).attr("class", "treemap-node-selected");

            } else {
                d3.select(this).attr("class", "treemap-node");
            }

        });

        //_self.updateViewsTreemap(selections);
    });




};

Business.prototype.getCategories = function () {

    var _self = this;

    if (_self.allCategories && Object.keys(_self.allCategories).length > 0) {

        return {
            "key": "Categories",
            "children": _self.allCategories
        };

    }


    _self.allCategories = {};

    _self.categoryRatings = {};

    _self.allBusinessKeys = Object.keys(_self.allBusinessObject);

    for (var i = 0; i < _self.allBusinessKeys.length; i++) {

        var key = _self.allBusinessKeys[i];

        var category1 = _self.allBusinessObject[key].category1;
        var category2 = _self.allBusinessObject[key].category2;

        if (_self.allCategories[category1]) {

            _self.allCategories[category1] ++;
            _self.categoryRatings[category1] = _self.categoryRatings[category1] + _self.allBusinessObject[key].rating;

        } else {

            _self.allCategories[category1] = 1;
            _self.categoryRatings[category1] = _self.allBusinessObject[key].rating;

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


Business.prototype.createCompanies = function (content) {

    var _self = this;
     
    var transform = 3; 

    var width = content.width * $(document).width(),
        height = content.height * $(document).height();


    if (content.aspectRatio) {
        height = width / content.aspectRatio;
    }

    $("#companiesDiv").remove();
    
    var div = _self.reviews = d3.select("#vizdashboard").append("div")
        .attr("class", "companies")
        .attr("id", "companiesDiv")
        .style("width", width + "px")
        .style("height", height + "px")

    var mark = content.marks[0]; 
    
    
    var nodes = div.selectAll(".companies-node")
        .data(_self.convertToArray())
        .enter().append(mark.type)
        .attr("class", mark.properties.enter.style.class);

    mark = content.marks[1]; 
    
    nodes.append(mark.type)
        .text(function (d) {
            return eval(mark.properties.enter.text.text);
        });

    mark = content.marks[2];
    var mark2 = content.marks[3];
    
    nodes.append(mark.type)
        .attr("class", mark.properties.enter.style.class)
        .append(mark2.type)
        .style("width", function (d) {
            return eval(mark.properties.enter.style.width) + "px";
        });

};


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

    nodes.append("text")
        .text(function (d) {
            return d.name;
        });

    nodes.append("span")
        .attr("class", "stars")
        .append("span")
        .style("width", function (d) {
            return (Math.max(0, (Math.min(5, d.rating))) * 16) + "px";
        });

    _self.geosvg
        .selectAll("circle")
        .style("fill-opacity", 0.001)
        .style("stroke-width", "0px")
        .style("z-index", 0);

    _self.geosvg
        .selectAll("circle")
        .data(_self.dataSelected)
        .attr("transform", function (d) {
            return "translate(" + _self.projection([d.lon, d.lat]) + ")";

        })
        .style("z-index", 100)
        .style("fill-opacity", 0.3)
        .style("border", "solid 1px white")
        .style("stroke-width", 0.5)
        .attr("r", function (d) {
            return 3 + d.review_count / 30;

        })
        .append("title")
        .text(function (d) {
            return d.name;
        });

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

}