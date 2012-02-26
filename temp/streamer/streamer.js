
$(function() {
    ClientStreamer.init();
    ServerStreamer.init();
});

var Timer = (function() {
    var start_time = Date.now();
    
    return {
        clientTime: function() {
            return Date.now() - start_time;
        },

        serverTime: function() {
            return Date.now() - start_time + 1;
        }
    };
})();

var ClientStreamer = (function() {
    
    function showPlaylist() {
        $("#client-playlist").empty();
        playlist.forEach(function(entry) {
            $("#playlist-entry-tmpl").tmpl(entry).appendTo("#client-playlist");
        });
    }

    var playlist = [];

    return {
        init: function() {
            showPlaylist();
        }
    };

})();

var ServerStreamer = (function() {
    
    function showPlaylist() {
        $("#server-playlist").empty();
        playlist.forEach(function(entry) {
            $("#playlist-entry-tmpl").tmpl(entry).appendTo("#server-playlist");
        });
    }
    
    var playlist = [
        {
            song: "song1",
            playtime: 5 
        },
        {
            song: "song2",
            playtime: 6
        },
        {
            song: "song3",
            playtime: 8
        },
        {
            song: "song4",
            playtime: 10
        },
        {
            song: "song5",
            playtime: 12
        },
        {
            song: "song6",
            playtime: 16
        },
        {
            song: "song7",
            playtime: 20
        },
        {
            song: "song8",
            playtime: 22
        },
        {
            song: "song9",
            playtime: 26 
        },
        {
            song: "song10",
            playtime: 30
        },
        {
            song: "song11",
            playtime: 31
        },
        {
            song: "song12",
            playtime: 33
        }
    ];
    
    return {
        init: function() {
            showPlaylist();
        },

        getSongs: function(time) {
            /* send 3 songs */
            Timer.serverTime(); 

        }
    };

})();
