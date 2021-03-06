
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , echojs = require('echojs')
  , _ = require("lodash");

var app = express();

// var lastfm = lastfm({
//   apiKey: process.env.LASTFM_API_KEY
// });

var echoNest = echojs({
  key: process.env.ECHONEST_API_KEY
});

var routes = require('./routes')(echoNest);

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

// This middleware needs to be registered BEFORE app.router
app.use(function(req, res, next) {
  var owner, repo;
  if (req.query.owner && req.query.repo) {
    res.cookie("owner", req.query.owner);
    res.cookie("repo", req.query.repo);

    owner = req.query.owner;
    repo = req.query.repo;
  }
  else if (req.cookies.owner && req.cookies.repo) {
    owner = req.cookies.owner;
    repo = req.cookies.repo;
  }
  else {
    owner = "aerobatic";
    repo = "barnstormer-ui-angular";
  }

  res.locals.owner = owner;
  res.locals.repo = repo;
  next();
});

app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;

app.locals({
  aerobaticAirportUrl: process.env.AEROBATIC_AIRPORT_URL || "http://localhost:7777",
  cockpitUrl: "//airport.aerobaticapp.com/cockpit.min.js",
  urlify: function(s) {
    return s.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.cockpitUrl = app.locals.aerobaticAirportUrl + "/cockpit.js";
}

app.get("/", routes.welcome);
app.get('/home', routes.homePage);
app.get('/artists/:artist', routes.artistDetail);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
