var AudioData = {
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
            AudioData.album = r.response;
            console.log("album: ", AudioData.album);

            getRadioPlaylist();
        }
    });
}

function getRadioPlaylist() {
    StreamClient.getPlaylist({
        stream_id : VK.Auth.getSession().user.id
    },
    function(playlist) {
        AudioData.playlist = playlist;
        console.log("playlist", AudioData.playlist);
        
        updateView();
		initActions();
		
		StreamPlayer.playStream(VK.Auth.getSession().user.id);    
    });
}

function initActions() {
    View.onPlaylistChanged(function(songs) {
		
        StreamClient.savePlaylist({
            stream_id: VK.Auth.getSession().user.id,
            playlist: songs
        },
        function() {
            StreamPlayer.playStream(VK.Auth.getSession().user.id);
        });
    });

    View.onPlaylistClicked({
        on_select: function(song, callback) {
            StreamClient.playSong({
                stream_id: VK.Auth.getSession().user.id,
                song_id: song.aid
            },
            function() {
                StreamPlayer.playStream(VK.Auth.getSession().user.id);
            });
        },

        on_unselect: function(song, callback) {
            StreamClient.stopPlaying({
                stream_id: VK.Auth.getSession().user.id
            },
            function() {
                StreamPlayer.playStream(VK.Auth.getSession().user.id);
            });
        }
    });
	
	StreamPlayer.setCallbacks({
		on_song_changed: function(song) {
			View.selectSong(song);
		},
		
		on_position_changed: function(percent){
			//console.log(percent);
		},
		
		on_stream_updated: function() {
		},
		
		on_stream_update_failed: function() {
			View.clearAllSelections();
		}
	});
}

function updateView() {

    var notInPlaylist = _.filter(AudioData.album, function(song) {
        var found = _.find(AudioData.playlist, function(p) {
            return p.aid == song.aid && p.owner_id == song.owner_id;
        });
        return !found;
    });
   
    View.setAlbumTracks(notInPlaylist);            
    View.setPlaylist(AudioData.playlist);
}
