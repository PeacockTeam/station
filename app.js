
var util = require("util"),
    url = require("url"),
    express = require("express")
    storage = require('./storage.js');

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

/* Engine */
var current_song;

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

app.post('/api/get_playlist', function(req, res) {
    console.log('/api/get_playlist');

    storage.getPlaylist(req.body.uid, function(songs) {
        if (songs) {
            res.send({
                songs: songs,
                current: current_song
            });
        } else {
            res.send({ error: "failed to get playlist" });
        }
    });
});

app.post('/api/save_playlist', function(req, res) {
    console.log('/api/save_playlist');

    storage.savePlaylist(req.body.uid, req.body.songs);
    res.send("success");
});

app.post('/api/select_song', function(req, res) {
    console.log('/api/select_song');

    if (req.body.song) {
        current_song = req.body.song;
    } else {
        current_song = undefined;
    }

    res.send("success");
});

app.listen(8080);

// console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
