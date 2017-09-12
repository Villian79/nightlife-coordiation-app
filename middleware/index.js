var User        = require('../models/user'),
    Location    = require('../models/location');

//======Create a MIDDLEWARE OBJECT. All middleware goes here=======
var middlewareObj = {};

//======Middleware to check if the user is logged in===============

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/auth/facebook');
};

module.exports = middlewareObj;
