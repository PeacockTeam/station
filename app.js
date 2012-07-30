
var util = require("util"),
    url = require("url"),
    express = require("express"),
    StreamManager = require('./stream_manager.js');

var app = module.exports = express.createServer();

// Don't crash on errors.
process.on("uncaughtException", function(error) {
    util.log(error.stack);
});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    });

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
    });

app.configure('production', function(){
    app.use(express.errorHandler()); 
    });

app.use(express.bodyParser());
app.use(app.router);

app.all('/*',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


/* Webapp routes */

app.get('/', function(req, res) {
    res.redirect('/radio');
});

app.get('/home', function(req, res){
    res.render('home', { title: 'Home' });
});

app.get('/radio', function(req, res){
    res.render('radio', { title: 'Radio' });
});


/* API routes */

app.post('/api/stream/get_playlist', function(req, res) {
    console.log('/api/stream/get_playlist');
    
    var stream_id = req.body.stream_id;
    
    SreamManager.getPlaylist(stream_id, function(playlist) {
        if (playlist) {
            res.send({ playlist : playlist });
        } else {
            res.send({ error: "failed to get stream" });
        }
    });
});

app.post('/api/stream/save_playlist', function(req, res) {
    console.log('/api/stream/save_playlist');
   
    var stream_id = req.body.stream_id,
        playlist = req.body.playlist;

    StreamManager.savePlaylist(stream_id, playlist, function() {
        res.send("ok");
    });
});

app.post('/api/stream/play_song', function(req, res) {
    console.log('/api/stream/play_song');

    var stream_id = req.body.stream_id,
        song_id = req.body.song_id;

    StreamManager.playSong(stream_id, song_id, function() {
        res.send("ok");
    });
});

app.post('/api/stream/stop_playing', function(req, res) {
    console.log('/api/stream/stop_playing');

    var stream_id = req.body.stream_id;

    StreamManager.stopPlaying(stream_id, function() {
        res.send("ok");
    });
});

app.post('/api/stream/get_current_songs', function(req, res) {
    console.log('/api/stream/get_current_songs');

    var stream_id = req.body.stream_id;

    StreamManager.getCurrentSongs(stream_id, function(current_songs) {
        if (current_songs) {
            res.send({ current_songs : current_songs });
        } else {
            res.send({ error: "failed to get current songs" });
        }
    });
});

app.listen(8080);
console.log("Express is running...");

