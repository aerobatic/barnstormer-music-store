
/*
 * GET home page.
 */
module.exports = function(echoNest) {
  return {
    homePage: function(req, res, next){
      echoNest('artist/top_hottt').get({}, function (err, json) {
        res.render('index', { 
          title: 'Barnstormer Music Store', 
          pageId: "home_page",
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
          return next(err);

        var artist = json.response.artist;
        res.render('artist', {
          title: 'Barnstormer Music - ' + artist.name,
          pageId: 'artist_detail',
          artist: artist
        });
      });
    }
  };
}