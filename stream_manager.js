var Storage = require('./storage.js');


function setStreamTimemarks(new_stream, old_stream) {

}

exports.getPlaylist = function(data, callback) {

    storage.getStream(data.stream_id, function(stream) {
        if (stream) {
            callback(stream.playlist);   
        } else {
            /* Return empty playlist */
            callback([]);
        }
    });
}

exports.savePlaylist = function(data, callback) {

    storage.getStream(data.stream_id, function(old_stream) {
        var new_stream = {
            playlist: data.playlist;
        };

        if (old_stream && old_stream.is_playing) {
            setStreamTimemarks(new_stream, old_stream);
        }

        storage.saveStream(data.stream_id, new_stream);
        callback();
    });
}

exports.playSong = function(data, callback) {
    
    storage.getStream(data.stream_id, function(stream) {
        if (stream) {
            stream.timemarks
            callback(stream.playlist);   
        }
        callback();
    });

}

exports.stopPlaying = function(data, callback) {
    
    storage.getStream(data.stream_id, function(stream) {
        if (stream) {
            stream.timemarks
            callback(stream.playlist);   
        }
        callback();
    });

}

exports.getNextSongs = function(data, callback) {

}
