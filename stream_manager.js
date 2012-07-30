var Storage = require('./storage.js');


function setStreamTimemarks(new_stream, old_stream) {

}

exports.getPlaylist = function(stream_id, callback) {

    Storage.getStream(stream_id, function(stream) {
        if (stream) {
            callback(stream.playlist);   
        } else {
            /* Return empty playlist */
            callback([]);
        }
    });
}

exports.savePlaylist = function(stream_id, playlist, callback) {

    Storage.getStream(stream_id, function(old_stream) {
        
        /* Set new timemarks to stream, if active */
        
        var new_stream = { playlist: playlist };

        if (old_stream && old_stream.is_playing) {
            setStreamTimemarks(new_stream, old_stream);
        }

        Storage.saveStream(stream_id, new_stream);
        callback();
    });
}

exports.playSong = function(stream_id, song_id, callback) {
    
    Storage.getStream(stream_id, function(stream) {
        if (stream) {
            
            /* Set new timemarks to stream */
            //stream.timemars <- song_id;

            Storage.saveStream(stream_id, stream);
        }
        
        callback();
    });
}

exports.stopPlaying = function(stream_id, callback) {
    
    Storage.getStream(stream_id, function(stream) {
        if (stream) {

            /* Remove timemarks if active */
            //stream.timemarks = null

            Storage.saveStream(stream_id, stream);
        }
        
        callback();
    });
}

exports.getCurrentSongs = function(stream_id, callback) {

    Storage.getStream(stream_id, function(stream) {
        if (stream) {
            /* If has timemarks, calc */
            
            var current_songs = stream.playlist.map(function(song) {
                return song;
            });

            callback({ current_songs: current_songs });
        } else {
            callback();
        }
    });
}
