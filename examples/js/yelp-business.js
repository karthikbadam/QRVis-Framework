
function Business(options) {

    var _self = this; 
    
    //_self.allBusiness = [];
    _self.allBusinessObject = {};

}

Business.prototype.addBusiness = function (business_id, lat, lon, category1, category2) {
    
    var business = {};
    business.business_id = business_id;
    business.lat = lat; 
    business.long = long; 

    //_self.allBusiness.push(business);
    _self.allBusinessObject.business_id = business;
}

Business.prototype.addReview = function (business_id, text) {

    _self.allBusinessObject[business_id].review.push(text);
    
}

