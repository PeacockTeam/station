var StreamClient = (function() {
    
    function logMessage(msg) {
        console.log("[StreamClient]: " + msg);
    }

    function logError(msg) {
        console.log("[StreamClient ERROR]: " + msg);
    }

    return {
        /**
         *  data = {
         *      stream_id
         *  }
         */
        getPlaylist : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/get_playlist",
				contentType: "application/json",
                data: JSON.stringify(data),
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        callback && callback(r.playlist);
                    }
                },
                error: function() {
                    logError("request failed");
                }
            });
        },
       
        /**
         * data = {
         *     stream_id,
         *     playlist
         * }
         */
        savePlaylist : function(data, callback) {			
			$.ajax({
                type: 'POST',
                url: "/api/stream/save_playlist",
				contentType: "application/json",
                data: JSON.stringify(data),
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage('playlist saved');
                        callback && callback();
                    }
                },
                error: function() {
                    logError("request failed");
                }
            });
        },
        
        /**
         * data = {
         *     stream_id,
         *     song_id,
         * }
         */
        playSong : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/play_song",
				contentType: "application/json",
                data: JSON.stringify(data),
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage("Playing song:" + data.song_id);
                        callback && callback();
                    }
                },
                error: function() {
                    logError("request failed");
                }
            });
        },

        /**
         * data = {
         *     stream_id
         * }
         */
        stopPlaying : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/stop_playing",
				contentType: "application/json",
                data: JSON.stringify(data),
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage("Playing stopped");
                        callback && callback();
                    }
                },
                error: function() {
                    logError("request failed");
                }
            });
        },

        /**
         * data = {
         *     stream_id
         * }
         */
        getPlayback : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/get_playback",
				contentType: "application/json",
                data: JSON.stringify(data),
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
						callback && callback();
                    } else {
                        callback && callback(r.playback);
                    }
                },
                error: function() {
                    logError("request failed");
                }
            });
        }

    };
})();
