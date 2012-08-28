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

/*
    Streams storage

    stream = {
        stream_id: "2323",
        playlist: [],
        playdata: {} (opt)
    }
*/

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
            stream,
            { 'upsert': true });
    });
}


/*
    Users storage

    user = {
        user_id: "323"
        subscribes: [],
        owns: []
    }
*/

exports.getUser = function(user_id, result) {
    db.collection("users", function(err, collection) {
        collection.find({ 'user_id': user_id }, function(err, cursor) {
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

exports.saveUser = function(user_id, user) {
    db.collection('users', function(err, collection) {
        collection.update(
            { user_id: user_id },
            user,
            { 'upsert': true });
    });
}


/*
    Station storage

    station = {
        station_id: "323",
        stream: {
            stream_id: "3434",
        },
        social: {
            owners: [],
            subscribers: []
        },
        content: {},
        metadata: {
            tags: [],
            statistics: {}
        }
    }
*/

exports.getStation = function(station_id, result) {
    db.collection("stations", function(err, collection) {
        collection.find({ 'station_id': station_id }, function(err, cursor) {
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

exports.saveStation = function(station_id, station) {
    db.collection('stations', function(err, collection) {
        collection.update(
            { station_id: station_id },
            station,
            { 'upsert': true });
    });
}
