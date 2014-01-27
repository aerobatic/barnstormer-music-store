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

    if (options.qs)
      _.extend(requestOpts.qs, options.qs);

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

        topArtists = _.map(data.artists.artist, function(artist) {
          return {
            name: artist.name,
            url: "/artists/" + encodeURIComponent(artist.name),
            image: artist.image[3]['#text']
          }
        });

        res.render("home", {
          title: "Barnstormer Music Store",
          pageId: "homePage",
          topArtists: topArtists
        });
      });
    },

    artistDetail: function(req, res, next) {
      lastFmApiCall({apiMethod: "artist.getInfo", qs:{artist: req.params.artist}}, function(err, info) {
        if (err)
          return next(err);

        lastFmApiCall({apiMethod: "artist.gettopalbums", qs:{artist: req.params.artist}}, function(err, albums) {
          if (err)
            return next(err);

          // Extract out just the attributes we care about from the LastFM response.
          var artist = {
            name: info.artist.name,
            lastFmUrl: info.artist.url,
            image: info.artist.image[4]['#text'],
            bio: info.artist.bio.summary,
            tags: _.map(info.artist.tags.tag, "name"),
            similar: _.map(info.artist.similar.artist, function(sim) {
              return {
                name: sim.name,
                url: '/artists/' + encodeURIComponent(sim.name),
                image: sim.image[3]['#text']
              }
            }),
            albums: _.map(albums.topalbums.album, function(album) {
              return {
                name: album.name,
                lastFmUrl: album.url,
                image: album.image[3]['#text']
              }
            })
          };

          res.render("artist", {
            pageId: "artistDetail",
            artist: artist
          });
        });
      });
    }
  };
}