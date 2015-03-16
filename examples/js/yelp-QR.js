function QRVis(options) {

    var _self = this;

    _self.parentId = options.parentId;

    _self.content_temp = {content: "Hope y'all are having a good weekend! Time for another week and a quick review of my activities Friday. I finished a bit in the red though I followed my plan for the most part, I just couldn't get anything going really. I started off w/ an awesome run on FXCM from $2.52, selling at $2.66 and $2.76, but then when I added back at $2.68 it failed and ate some of my profit so unfortunately it didn't follow through the way I'd hoped. I also got an old alert on CYTK and noticed it forming support at 8 so I grabbed a starter position there for a bounce and break of $8.10. That didn't work out either and I stopped out at $7.89. Finally I shorted the $41.10 breakdown on MBLY intraday which worked nicely but I wasn't aggressive enough on the size because I really wanted a short near $41.50 so when it only worked for a partial gain it wasn't enough to account for CYTK. However despite this technically I was still green on Friday because I added more to my NKA swing at $1.90 so I now have a $1.96 average on it and am anticipating that will move next week for a big gain! So anyway, most of the loss was just commissions combined with half winners lol but it's part of the game. I was happy with my trading regardless of a bit of red. You can check out a more detailed review of my week and what I'm planning for next week here. Also, here is my list of ideas for tomorrow! DMND - I really like the daily on this. It showed some really nice strength on Friday breaking out of its daily flag and running right into resistance at $31. I'd like to buy this at $30.30-30.50 on a morning pullback, anticipating that it will come back and break $31 for a push to $32. I think a stop under $30 is safe in this scenario. If it holds above $30.60 in the morning and tucks up against $31 then I am ok playing a $31 breakout with a stop under $30.60 but that is not the ideal setup. RGDO - Still watching this for a push back through $1.50 for a $1.75-2.00 run. I don't want to see it go lower than Thursday's low ($1.42) and if it does I will still hold my swing but won't be day trading it. In order or it to be a day trade it needs to open basically where it closed, stay above $1.42 and then break $1.50 with a volume thrust. TCPI - I'm hoping this gaps up a little bit to $2.50-2.55 since I think if it opens flat or gaps down it will just dump right out of the gate and probably exhaust the whole move in the first 10 min. If it can gap up or bounce a little in the morning I'll be watching for any volume hitting the bids to short for a breakdown of Friday's low. My ideal entry spot is $2.57-2.60 with a $2.80 stop and a possible $2.10-2.00 target. NRZ - Daily is looking a bit weak under Friday's low, especially below $14.50. I'll be watching for a quick rebound to $14.80-90 off the extended downward move on Friday afternoon, and will short with a stop over $15. If it gaps down I'll be watching for the first pop to start shorting with risk against the high of day. I also am still watching AT over $2.95, FWM over $6, ONP for a parabolic short $1.70-1.80 and PRSS for a swing trade over $3.50-3.60. Also I have AMPE and AMRN on the list as my two favorite possible parabolic shorts. Going to keep the list short and sweet for now and see how things look tomorrow."};
    
    _self.content = {};

}

QRVis.prototype.addDimensions = function (width, height, type, aspectRatio) {
    var _self = this; 
    
    // compute percentages 
    _self.content.width = width/$(document).width();
    _self.content.height = height/$(document).height();
    _self.content.type = type; 
    _self.aspectRatio = aspectRatio? aspectRatio: 0; 

}

QRVis.prototype.addData = function (filename, dataAttributes) {

    var _self = this; 
    
    if (_self.content.data) {
        _self.content.data = [];
    }
    
    _self.content.data.push({
        filename: filename,
        attributes: dataAttributes
    });
    
}

QRVis.prototype.addScales = function (name, type, domain, range) {
    
    var _self = this; 
    
    if (_self.content.scales) {
        _self.content.scales = [];
    }
    
    _self.content.scales.push({
        name: name,
        type: type,
        domain: domain, 
        range: range
    }); 
    
}

QRVis.prototype.addMarks = function (type, from, enter, update, hover, device) {
    
    var _self = this; 
    
    if (_self.content.marks) {
        _self.content.marks = [];
    }
    
    _self.content.marks.push({
        type: type, 
        from: from,
        device: device,
        properties: {
            enter: enter,
            update: update, 
            hover: hover
        }
    });   
}

QRVis.prototype.makeQR = function () {

    var _self = this;

    _self.numberOfFrames = 15;

    var w = 150;
    var h = 150;

    var data = JSON.stringify(jsonpack.pack(_self.content));
    
    d3.select("#vizdashboard").append("div")
       .attr("id", "QRCodesDiv-" + _self.parentId);
    
    qrvis.generate("QRCodesAnim-" + _self.parentId, "QRCodesDiv-" + _self.parentId, _self.numberOfFrames, data, w, h);
    
    var offset = $("#"+_self.parentId).offset();
    var offsetx = offset.left;
    var offsety = offset.top;
    
    var parentWidth = $("#"+_self.parentId).width();
    var parentHeight = $("#"+_self.parentId).height();
    
    d3.select("#QRCodesAnim-" + _self.parentId)
        .style("position", "relative");
    
    d3.select("#QRCodesDiv-" + _self.parentId)
        .style("position", "absolute")
        .style("left", (offsetx + parentWidth - 170)+"px")
        .style("top", (offsety + parentHeight - 170)+"px");
}    