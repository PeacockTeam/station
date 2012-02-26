var Audio = {
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
        getSongs();
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
}

function getSongs() {
    VK.Api.call('audio.get', {
        count: 20
    }, function(r) {
        if (r.error) {
            console.log('failed to get album: ', r.error);
        } else {
            Audio.album = r.response;
            console.log("album: ", Audio.album);

            getPlaylist();
        }
    });
}

function getPlaylist() {
    $.ajax({
        type: 'POST',
        url: "/api/get_playlist",
        data: {
            uid: VK.Auth.getSession().user.id,
        },
        success: function(r) {
            if (r.error) {
                console.log('Error: ', r.error);
            } else {
                Audio.playlist = r.songs;
                Audio.current = r.current;
                console.log("playlist", Audio.playlist);
            }
            updateView();
        }
    });
}

function initActions() {
    View.onPlaylistChanged(function(songs) {
        $.ajax({
            type: 'POST',
            url: "/api/save_playlist",
            data: {
                uid: VK.Auth.getSession().user.id,
                songs: songs
            },
            success: function(r) {
                if (r.error) {
                    console.log('Error: ', r.error);
                } else {
                    console.log('Playlist saved');
                }
            }
        });
    });

    View.onPlaylistClicked({
        on_select: function(song, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/select_song",
                data: {
                    uid: VK.Auth.getSession().user.id,
                    song: song
                },
                success: function(r) {
                    if (r.error) {
                        console.log('Error: ', r.error);
                    } else {
                        console.log("Selected", song);
                        callback();
                    }
                }
            });
        },

        on_unselect: function(song, callback) {
            $.ajax({
                type: 'POST',
                url: "/api/select_song",
                data: {
                    uid: VK.Auth.getSession().user.id,
                    song: undefined
                },
                success: function(r) {
                    if (r.error) {
                        console.log('Error: ', r.error);
                    } else {
                        console.log("Unselected", song);
                        callback();
                    }
                }
            });
        }
    });

    View.onSelectedSongRemoved(function() {
        $.ajax({
            type: 'POST',
            url: "/api/select_song",
            data: {
                uid: VK.Auth.getSession().user.id,
                song: undefined
            },
            success: function(r) {
                if (r.error) {
                    console.log('Error: ', r.error);
                } else {
                    console.log("Unselected");
                }
            }
        });
    });
}

function updateView() {

    var notInPlaylist = _.filter(Audio.album, function(song) {
        var found = _.find(Audio.playlist, function(p) {
            return p.aid == song.aid && p.owner_id == song.owner_id;
        });
        return !found;
    });
   
    View.setAlbumTracks(notInPlaylist);            
    View.setPlaylist(Audio.playlist);

    if (Audio.current) {
        View.selectSong(Audio.current);
    }
    
    initActions();
}
