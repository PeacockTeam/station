var Player = {
    songs: [],
    current: null,

    initMusic: function() {
        soundManager.flashVersion = 9;
        soundManager.debugMode = false;
    },

    playSong: function(url) {
        soundManager.createSound({
            id: 'music',
            url: url,
            volume: 100,
            autoLoad: true,
            stream: false,
            autoPlay: true
        });
    }
};

$().ready(function () {
    initVK();
    Player.initMusic();
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
        getPlaylist();
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
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
                Player.songs = r.songs;
                Player.current = r.current;

                if (Player.current) {
                    View.setCurrentSong(Player.current);
                    Player.playSong(Player.current.url);
                }
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


