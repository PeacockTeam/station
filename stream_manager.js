var Storage = require('./storage.js'),
          _ = require('underscore');

var PlaybackCalculator = (function() {

    return {

        getPlayData: function(playlist, current_song_id) {

            var t_before_current_song = 0,
                t_playlist = 0,
                playtimes = [];

            var current_song_found = false;

            for (var i = 0; i < playlist.length; i++) {
                var song = playlist[i];

                // 1) check if i-th song has current id
                if (!current_song_found) {
                    if (playlist[i].aid == current_song_id) {
                        current_song_found = true;
                        t_before_current_song = t_playlist;
                    }
                }

                // 2) save time when i-th song starts
                playtimes.push(t_playlist);

                // 3) increase total playlist time
                t_playlist += song.duration * 1000;
            }

            var t_start = new Date.getTime() - t_before_current_song;

            return {
                t_start: t_start,
                t_playlist: t_playlist,
                playtimes: playtimes
            };
        },

        getModifiedPlaydata: function(new_playlist, old_playlist, old_playdata) {

            //1) определить текущую песню
            var t_now = new Date.getTime(),
                t_current_playlist_cycle_time = (t_now - old_playdata.t_start) % old_playdata.t_playlist,
                current_song_index = _.sortedIndex(old_playdata.playtimes, t_current_playlist_cycle_time);

            //2) найти её в новом плейлисте

            var current_song = old_playlist[current_song_index],
                new_current_song_index = _.find(new_playlist, function(song) { return song.aid == current_song.aid; });


            //3) высчитать разницу во времени
            //4) обновить


            return {
                t_start: t_start,
                t_playlist: t_playlist,
                playtimes: playtimes
            };
        },

        getPlayback: function(playlist, playdata) {

            var songs = [];

            var t_now = new Date.getTime(),
                t_current_playlist_cycle_time = (t_now - playdata.t_start) % playdata.t_playlist,
                current_song_index = _.sortedIndex(playdata.playtimes, t_current_playlist_cycle_time);

            var t_song_start = playdata.playtimes[current_song_index],
                t_playback_total = 0;

            var t_current_song_offset = t_now - t_song_start;

            function need_more_songs() {
                if (songs.length < 2) {
                    return true; /* At list one next song for caching */
                }

                var MIN_PLAYBACK_TIME = 10 * 60 * 1000; // 10 minutes
                if (t_playback_total - t_current_song_offset < MIN_PLAYBACK_TIME) {
                    return true; /* Total playback time must be long enough */
                }

                return false;
            }

            while (need_more_songs()) {

                var song = _.extend(
                    playlist[current_song_index],
                    {
                        start_time: t_song_start
                    });

                songs.push(song);

                current_song_index = (current_song_index + 1) % playlist.length;

                t_playback_total += song.duration * 1000;
                t_song_start += song.duration * 1000;
            }

            return { songs: songs };
        }
    };
});

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

    Storage.getStream(stream_id, function(stream) {

        if (stream) {

            if (stream.playdata) {
                var current_song_id = stream.

            }

            stream.playlist = playlist;
            Storage.saveStream(stream_id, stream);

        } else {
            Storage.saveStream(stream_id, {
                stream_id: stream_id,
                playlist: playlist
            });
        }
        /* Set new timemarks to stream, if active */

        //var new_stream = { playlist: playlist };

        /*
        if (old_stream && old_stream.is_playing) {
            setStreamTimemarks(new_stream, old_stream);
        }
        */

        callback();
    });
}

exports.playSong = function(stream_id, song_id, callback) {
    
    Storage.getStream(stream_id, function(stream) {
        if (stream) {

            stream.song_id = song_id;
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

            delete stream.song_id;
            /* Remove timemarks if active */
            //stream.timemarks = null

            Storage.saveStream(stream_id, stream);
        }
        
        callback();
    });
}

exports.getPlayback = function(stream_id, callback) {

    Storage.getStream(stream_id, function(stream) {
        if (stream) {
            /* If has timemarks, calc */

            var current_song = _.find(stream.playlist, function(song) {
                return song.aid == stream.song_id;
            });

            if (current_song) {
                callback({current_song: current_song});
            } else {
                callback();
            }

        } else {
            callback();
        }
    });
}
