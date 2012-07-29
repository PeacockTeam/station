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
        getStream : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/get_stream",
                data: data,
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        callback(r.stream);
                    }
                }
            });
        },
       
        /**
         * data = {
         *     stream_id,
         *     stream
         * }
         */
        saveStream : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/save_stream",
                data: data
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage('stream saved');
                        callback();
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
         *     song,
         * }
         */
        playSong : function(data, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/play_song",
                data: data,
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage("Playing song: ", song);
                        callback();
                    }
                }
            });
        },

        /**
         * data = {
         *     stream_id
         * }
         */
        stopPlaying : function(data) {
            $.ajax({
                type: 'POST',
                url: "/api/stream/stop_playing",
                data: data,
                success: function(r) {
                    if (r.error) {
                        logError(r.error);
                    } else {
                        logMessage("Playing stopped");
                        callback();
                    }
                }
            });
        }        

    };
})();
