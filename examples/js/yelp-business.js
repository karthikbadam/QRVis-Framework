
function Business(options) {

    var _self = this; 
    
    _self.allBusiness = [];
    _self.allBusinessObject = {};

}

Business.prototype.addBusiness = function (business_id, lat, lon, category1, category2, rating) {
    
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

