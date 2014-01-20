var _ = require("lodash");

/*
 * GET home page.
 */
module.exports = function(echoNest) {
  return {
    welcome: function(req, res, next) {
      res.render("welcome", {
        app: req.cookies.app
      });
    },  
    homePage: function(req, res, next){
      echoNest('artist/top_hottt').get({}, function (err, json) {
        if (err)
          return next(new Error("Error from echonest: " + JSON.stringify(err)));          

        res.render('home', { 
          title: 'Barnstormer Music Store', 
          pageId: "homePage",
          hotArtists: json.response.artists 
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