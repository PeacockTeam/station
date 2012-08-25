var AudioBlock = {
    album: [],
    playlist: [],
    current: undefined 
};

$(function () {
    initVK();
});

function initVK() {
    VK.init({
        apiId: 2781985
    });
    VK.UI.button('login_button');
    $('#login_button').click(function() {
        VK.Auth.login(onLogin, 8); // Access to audio
    });
}

function onLogin(r) {
    if (r.session) {
        console.log('User has logged in:', r.session.mid);
        View.toggleMainView();
        getUserPlaylist();
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
}

function getUserPlaylist() {
    VK.Api.call('audio.get', {
        count: 20
    }, function(r) {
        if (r.error) {
            console.log('failed to get user playlist: ', r.error);
        } else {
            AudioBlock.album = r.response;
            console.log("album: ", AudioBlock.album);

            getRadioPlaylist();
        }
    });
}

function getRadioPlaylist() {
    StreamClient.getPlaylist({
        stream_id : VK.Auth.getSession().user.id
    },
    function(playlist) {
        AudioBlock.playlist = playlist;
        console.log("playlist", AudioBlock.playlist);
        
        updateView();
    });
}

function initActions() {
    View.onPlaylistChanged(function(songs) {
		
        StreamClient.savePlaylist({
            stream_id: VK.Auth.getSession().user.id,
            playlist: songs
        },
        function() {
            /* Update StreamPlayer */
            /* Update View (Selection) */
        });
    });

    View.onPlaylistClicked({
        on_select: function(song, callback) {
            StreamClient.playSong({
                stream_id: VK.Auth.getSession().user.id,
                song_id: song.aid
            },
            function() {
                /* Update StreamPlayer */
                /* Update View (Selection) */
            });
        },

        on_unselect: function(song, callback) {
            StreamClient.stopPlaying({
                stream_id: VK.Auth.getSession().user.id
            },
            function() {
                /* Update StreamPlayer */
                /* Update View (Selection)*/
            });
        }
    });
}

function updateView() {

    var notInPlaylist = _.filter(AudioBlock.album, function(song) {
        var found = _.find(AudioBlock.playlist, function(p) {
            return p.aid == song.aid && p.owner_id == song.owner_id;
        });
        return !found;
    });
   
    View.setAlbumTracks(notInPlaylist);            
    View.setPlaylist(AudioBlock.playlist);

    /*if (Audio.current) {
        View.selectSong(Audio.current);
    }*/
    
    initActions();
}
