
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , echojs = require('echojs')
  , _ = require("lodash");

var app = express();

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
  res.locals.aerobaticAppId = req.cookies.aerobaticAppId || "barnstormer-ui-angular";
  next();
});

app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.locals.pretty = true;

app.locals({
  aerobaticAirportUrl: process.env.AEROBATIC_AIRPORT_URL || "http://localhost:7777",
  urlify: function(s) {
    return s.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.homePage);
app.get('/artists/:name/:id', routes.artistDetail);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
