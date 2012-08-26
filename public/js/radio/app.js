
$().ready(function () {
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
        
		StreamPlayer.setCallbacks({
			on_song_changed: function(song) {
				View.setCurrentSong(song);
			}
		});
		StreamPlayer.playStream(VK.Auth.getSession().user.id);
    }
    else {
        console.log('auth failed');
        alert('Sorry, authentification failed');
    }
}