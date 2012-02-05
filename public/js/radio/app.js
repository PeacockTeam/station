
var Audio = {
    playlist: [],
    nowPlaying: null;
}

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

function getPlaylist() {
    $.ajax({
        type: 'GET',
        url: "/api/get_playlist",
        success: function(r) {
            if (r.error) {
                console.log('Error: ', r.error);
            } else {
                Audio.playlist = r.playlist;
                Audio.nowPlaying = r.current;

                console.log("playlist", Audio.playlist, Audio.nowPlaying);
                
                updateView();
            }
        }
    });
}

/*
function getSongUrl(song) {
    VK.Api.call('audio.get', {
        aids: song.aid,
        uid: song.owner_id,
    }, function(r) {
        if (r.error) {
            console.log('failed to get album: ', r.error);
        } else {
            r.response
        }
    });
}*/

function updateView() {
    View.setCurrentSong(Audio.nowPlaying);
}

