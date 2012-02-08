var mongodb = require("mongodb"),
    config = require("./config.js");

var mongo = new mongodb.Server(
        config.mongo.host,
        config.mongo.port);

var db = new mongodb.Db(
        config.mongo.database,
        mongo);

db.open(function(error) {
    if (error) throw error;
});

exports.getPlaylist = function(uid, result) {
    db.collection("playlists", function(err, collection) {
        collection.find({ 'uid': uid }, function(err, cursor) {
            cursor.toArray(function(err, items) {
                if (items.length > 0) {
                    result(items[0].songs);
                } else {
                    result();
                }
            });
        });
    });
}

exports.savePlaylist = function(uid, songs) {
    db.collection('playlists', function(err, collection) {
        collection.update(
            { uid: uid },
            { '$set': { 'songs': songs } },
            { 'upsert': true });
    });
}

