
var util = require("util"),
    url = require("url"),
    express = require("express")
//    logic = require('./logic.js');

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

//Routes

app.all('/*',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.get('/', function(req, res) {
    res.redirect('/radio');
});

app.get('/home', function(req, res){
    res.render('home', { title: 'Home' });
});

app.get('/radio', function(req, res){
    res.render('radio', { title: 'Radio' });
});

app.get('/api/get_playlist', function(req, res) {
    console.log('/api/get_playlist');
    res.send({ playlist: [
        {
             aid: "135978633",
             artist: "Robert Plant",
             duration: "356",
             lyrics_id: "5645220",
             owner_id: "1070976",
             title: "Song To The Siren",
             url: "http://cs4890.vkontakte.ru/u24016347/audio/3947e7c53f58.mp3"
        },
        {
            aid: "135755750",
            artist: "Gabba Front Berlin",
            duration: "176",
            owner_id: "1070976",
            title: "A Man Who Looks Like Me",
            url: "http://cs1588.vkontakte.ru/u178718/audio/06a8acf5de10.mp3"
        }
    ]});
});

app.post('/api/set_playlist', function(req, res) {
    console.log("set playlist");
    res.send("success");
});

app.listen(8080);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

