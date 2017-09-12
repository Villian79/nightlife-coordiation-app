const express           = require('express'),
      app               = express(),
      bodyParser        = require('body-parser'),
      mongoose          = require('mongoose'),
      RapidAPI          = require('rapidapi-connect'),
      session           = require('express-session'),
      morgan            = require('morgan'),
      cookieParser      = require('cookie-parser');
      passport          = require('passport'),
      FacebookStrategy  = require('passport-facebook').Strategy;


var User            = require('./models/user');
var City            = require('./models/location');
var configAuth      = require('./config/auth');
var middleware      = require('./middleware/index');


//config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(require('express-session')({ secret: 'Nightlife Coordination App', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://ivilinchuk:igorito@ds121464.mlab.com:21464/nightlife_app', {useMongoClient: true});

const rapid = new RapidAPI("nightlife", "7e884fc0-85a7-40d0-b006-dcc58d234646");

//=====================================================
//PASSPORT config
//=====================================================
var fbOpts = {
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id', 'displayName', 'email']
};

var fbCallBack = function(accessToken, refreshToken, profile, cb){

        User.findOne({'id': profile.id}, function(err, user){
            if(err){
                return cb(err);
            }
            if(user){
                return cb(null, user);
            }
            else{
                User.create({
                    id: profile.id,
                    token: accessToken,
                    name: profile.displayName,
                    email: profile.emails[0].value
                }, function(err, user){
                    if(err){
                        console.log('There was an error adding a new user' + err);
                    }
                    else{
                        console.log('New user has been added to the DB');
                        console.log(user)
                    }
                });
            }
        });
}

passport.use(new FacebookStrategy(fbOpts, fbCallBack));

passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, user);
});

//====================================End of Passport config========================

//==============================================Auth Routes==========================
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }), function(req, res){
      res.redirect('/');
  });
//==============================================End of auth routes====================

//LANDING page route
app.get('/', (req, res)=>{
    res.render('landing');
});
//=====================Testing AUTH. should be deleted==================================================
app.get('/success', (req, res)=>{
    if(req.isAuthenticated()){
        console.log("USER is logged in");
        console.log('User: ' + req.user.name);
    }
    else{
        console.log("NOT LOGGED IN");
    }
    res.render('success');
});
//======================End of testing AUTH
app.get('/error', (req, res)=>{
    res.render('error');
});


//SHOW route
app.get('/placesnearby', (req, res)=>{
    res.render('placesnearby');
})
//========Require data from YelpAPI======================================================
app.post('/placesnearby', (req, res)=>{
        let location = req.body.location;
        rapid.call('YelpAPI', 'getBusinesses', {
    	'accessToken': 'UHQNkB_jT1owIxkFp19SoGF7m_RhDeXV2AY2Rj9znLpSJ6fxUaqpCEgDGlbpXoHdu3HSFHwmmFCiBuARDs08aW4c7wgf3Sy2jJrfJAY8S8tjjnOQ8IuNxrqfyj6pWXYx',
    	'location': location,
        'term': 'bars',
        'radius': 20000,
        'sortBy': 'distance',
        'limit': 20
    }).on('success', (payload)=>{
//===================================Check location entry with DB ==========================
                City.findOne({name: location}, function(err, loc){
                    if(err){
                        return err;
                    }
                    //if location is already in DB - render the placesnearby page
                    if (loc) {
                        console.log('This location is already in the DB');
                        res.render('placesnearby', {payload: loc, location: location});
                    }
                    else{
                    //if location in NOT in DB - create one and render the placesnearby page
                        var businesses = [];
                        payload.businesses.forEach(function(business){
                        businesses.push({
                            id: business.id,
                            name: business.name,
                            image_url: business.image_url,
                            url: business.url,
                            display_address: business.location.display_address,
                            display_phone: business.display_phone,
                            distance: business.distance,
                            businessReserved: []});
                        });
                        City.create({
                            name: location,
                            businesses: businesses
                        }, function(err, loc){
                            if(err){
                                console.log('There was an Error adding new location to the DB ' + err);
                            }
                            else{
                                console.log('New LOCATION has been successfully added to the DB');
                                console.log(loc);
                                res.render('placesnearby', {payload: loc, location: location});
                            }
                        });
                    }
                });


    }).on('error', (payload)=>{
    	console.log("Error");;
    });
});
//==================================End of location checking logic=======================================

//UPDATE route
app.get('/:location/:id', middleware.isLoggedIn, function(req, res){
    City.findById('59b7c3783703861b8c5540d0', function(err, foundBusiness){
        if(err){
            console.log(err);
        }
        else{
            console.log(foundBusiness);
        }
    });
});


//LOGOUT route
app.get('/logout', (req, res)=>{
    console.log('Logging out...');
    req.logout();
    res.redirect('/');
});

app.listen(3000 || process.env.PORT, process.env.IP, ()=>{
    console.log('Server is running');
});
