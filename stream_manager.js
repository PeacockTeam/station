var Storage = require('./storage.js'),
          _ = require('underscore');

var StreamPlayback = (function() {

    function getPlaylistCycleData(playlist) {
        
        var full_cycle_time = 0,
            song_start_times = [];

        for (var i = 0; i < playlist.length; i++) {
            song_start_times.push(full_cycle_time);
            full_cycle_time += playlist[i].duration * 1000;
        }

        return {
            full_cycle_time: full_cycle_time,
            song_start_times: song_start_times
        };
    }

    function getSongIndexById(playlist, song_id) {
        for (var i = 0; i < playlist.length; i++) {
            if (playlist[i].aid == song_id) {
                return i;
            }
        }
    }
    
    function getPlayingSongIndex(playlist, playdata, now) {
        var current_cycle_playtime = (now - playdata.start_time) % playdata.full_cycle_time,
            sorted_index = _.sortedIndex(playdata.song_start_times, current_cycle_playtime);
        return sorted_index - 1; 
    }

    function getCurrentCycleStartTime(playlist, playdata, now) {
        var full_cycles = Math.floor( (now - playdata.start_time) / playdata.full_cycle_time );
        return playdata.start_time + playdata.full_cycle_time * full_cycles; 
    }

    return {

        isPlaying: function(stream) {
            return stream.playdata !== undefined;
        },

        startPlaying: function(stream, song_id, now) {
    
            var song_index = getSongIndexById(stream.playlist, song_id);
            if (!song_index) {
                // песни с таким id нет в плейлисте
                return;
            }

            // вычисляем параметры проигрывания
            var playlist_cycle_data = getPlaylistCycleData(stream.playlist);
           
            // вычисляем точку отсчета для плейлиста
            var playlist_start_time = now - playlist_cycle_data.song_start_times[song_index]; 

            stream.playdata = _.extend(playlist_cycle_data, {
                start_time: playlist_start_time
            });
        },

        stopPlaying: function(stream) {
            if (this.isPlaying(stream)) {
                delete stream.playdata;
            }
        },

        updateActivePlaylist: function(stream, new_playlist, now) {
            
            // достаём песню, которая проигрывается в данный момент
            var current_song_index = getPlayingSongIndex(stream.playlist, stream.playdata, now); 
            var current_song = stream.playlist[current_song_index];

            // находим её в новом плейлисте
            var new_song_index = getSongIndex(new_playlist, current_song.aid); 
            if (!new_song_index) {
                /* если в новом плейлисте нет текущей песни - прекращаем проигрывание */
                stopPlaying(); 
                return;
            }

            // вычисляем параметры проигрывания для нового плейлиста
            var new_playlist_cycle_data = getPlaylistCycleData(new_playlist);
            
            // время начала проигрывания текущей песни должно остаться прежним для нового плейлиста
            var current_cycle_start_time = getCurrentCycleStartTime(stream.playlist, stream.playdata, now);
            var song_start_time = current_cycle_start_time + stream.playdata.song_start_times[current_song_index];
            var new_playlist_start_time = song_start_time - new_playlist_cycle_data.song_start_times[new_song_index]; 
            
            stream.playdata = _.extend(new_playlist_cycle_data, {
                start_time: new_playlist_start_time
            });
        },

        getPlayback: function(stream, now) {

            var songs = [];

            var playing_song_index = getPlayingSongIndex(stream.playlist, stream.playdata, now),
                current_cycle_start_time = getCurrentCycleStartTime(stream.playlist, stream.playdata, now);

            var playing_song_start_time =
                current_cycle_start_time +
                stream.playdata.song_start_times[playing_song_index];

            var total_playback_time = 0,
                playing_song_offset = now - playing_song_start_time;

            function need_more_songs() {
                console.log("need more songs()");

                if (songs.length < 2) {
                    return true; // как минимум еще одна песня должна отсылаться для кэширования 
                }

                var MIN_PLAYBACK_TIME = 10 * 60 * 1000; // 10 minutes
                
                console.log(total_playback_time + " " + MIN_PLAYBACK_TIME);

                if (total_playback_time - playing_song_offset < MIN_PLAYBACK_TIME) {
                    return true; // total playback time must be long enough
                }

                return false;
            }
            
            var song_start_time = playing_song_start_time,
                song_index = playing_song_index;

            while (need_more_songs()) {

                var song = _.extend(
                {
                    start_time: song_start_time
                },
                stream.playlist[song_index]);

                songs.push(song);

                song_index = (song_index + 1) % stream.playlist.length;

                total_playback_time += song.duration * 1000;
                song_start_time += song.duration * 1000;
            }

            return { songs: songs };
        }
    };
})();

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

exports.streamPlayback = StreamPlayback;

exports.savePlaylist = function(stream_id, playlist, callback) {

    Storage.getStream(stream_id, function(stream) {

        if (stream) {

            if (stream.playdata) {
          //      var current_song_id = stream.

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
};

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
};

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
};

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
};
