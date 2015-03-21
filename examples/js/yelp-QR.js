function QRVis(options) {

    var _self = this;

    _self.parentId = options.parentId;

    _self.content = {};

}

QRVis.prototype.addDimensions = function (width, height, type, aspectRatio) {
    var _self = this; 
    
    // compute percentages 
    //_self.content.width = parseFloat(width/$(document).width()).toFixed(2);
    _self.content.width = 0.9;
    _self.content.height = parseFloat(height/$(document).height()).toFixed(2);
    _self.content.type = type; 
    _self.content.aspectRatio = aspectRatio? aspectRatio: 1; 

}

QRVis.prototype.addData = function (name, filename, dataAttributes) {

    var _self = this; 
    
    if (!_self.content.data) {
        _self.content.data = [];
    }
    
    _self.content.data.push({
        name: name,
        filename: filename,
        attributes: dataAttributes
    });
    
}

QRVis.prototype.addScales = function (name, type, domain, range) {
    
    var _self = this; 
    
    if (!_self.content.scales) {
        _self.content.scales = [];
    }
    
    _self.content.scales.push({
        name: name,
        type: type,
        domain: domain, 
        range: range
    }); 
    
}

QRVis.prototype.addMarks = function (type, from, device, enter, update, hover) {
    
    var _self = this; 
    
    if (!_self.content.marks) {
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
