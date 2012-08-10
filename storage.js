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

exports.getStream = function(stream_id, result) {
    db.collection("streams", function(err, collection) {
        collection.find({ 'stream_id': stream_id }, function(err, cursor) {
            cursor.toArray(function(err, items) {
                if (items.length > 0) {
                    result(items[0]);
                } else {
                    result();
                }
            });
        });
    });
}

exports.saveStream = function(stream_id, stream) {
    db.collection('streams', function(err, collection) {
        collection.update(
            { stream_id: stream_id },
            stream, //{ '$set': { 'playlist': stream.playlist } },
            { 'upsert': true });
    });
}

