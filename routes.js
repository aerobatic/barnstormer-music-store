var _ = require("lodash"),
  request = require("request"),
  querystring = require('querystring');

/*
 * GET home page.
 */
module.exports = function(echoNest) {
  function lastFmApiCall(options, callback) {
    _.defaults(options, { method: 'GET'});

    var requestOpts = {
      url: 'http://ws.audioscrobbler.com/2.0/',
      method: options.method,
      headers: {
        'User-Agent': 'aerobatic'
      },
      qs: {
        method: options.apiMethod,
        api_key: process.env['LASTFM_API_KEY'],
        format: 'json'
      }
    };

    request(requestOpts, function(err, resp, body) {
      console.log("LastFM api call to " + requestOpts.url + "?" + querystring.stringify(requestOpts.qs) + " returned status " + resp.statusCode);

      if (err)
        return callback(err);

      var json;
      try {
        json = JSON.parse(body);
      }
      catch (e) {
        err = new Error("Could not parse LastFM api response as JSON");
      }
     
      callback(err, json);
    });    
  }

  return {
    welcome: function(req, res, next) {
      res.render("welcome", {
        app: req.cookies.app
      });
    },  
    homePage: function(req, res, next){
      lastFmApiCall({apiMethod: "chart.getTopArtists"}, function(err, data) {
        if (err)
          return next(err);

        res.render("home", {
          title: "Barnstormer Music Store",
          pageId: "homePage",
          topArtists: data.artists.artist
        });
      });
    },
    artistDetail: function(req, res, next) {
      var echoParams = {
        "id": req.params.id,
        "bucket": ["biographies", "blogs", "familiarity", "hotttnesss", "images", "news", "reviews", "urls", "terms", "video", "id:musicbrainz"]
      };

      echoNest('artist/profile').get(echoParams, function(err, json) {
        if (err)
          return next("Error from echonest: " + JSON.stringify(err));

        var artist = json.response.artist;
        res.render('artist', {
          title: 'Barnstormer Music - ' + artist.name,
          pageId: 'artistDetail',
          artist: artist
        });
      });
    }
  };
}