var StreamPlayer = (function() {
	
	var state = {
		stream_id: null,
		playback: null
	};
	
	var Player = {
		songs: [],
		current: null,

		initMusic: function() {
			soundManager.flashVersion = 9;
			soundManager.debugMode = false;
		},

		playUrl: function(url) {
			soundManager.createSound({
				id: 'music',
				url: url,
				volume: 100,
				autoLoad: true,
				stream: false,
				autoPlay: true
			});
		}
		
		stopPlaying: function() {
			soundManager.stop('music');		
		}
	};
	
	Player.initMusic();
	
    return {
		playStream: function(stream_id) {
			StreamClient.getPlayback(stream_id, function(playback) {
				state.stream_id = stream_id;
				if (playback) {
					state.playback = playback;
					Player.playUrl(playback.current_song.url);
				} else {
					this.stopPlaying();
				}
			});
		},
		
		updateStream: function() {
			state.stream_id && this.playStream(state.stream_id);
		},
		
		stopPlaying: function() {
		
		}
    };

})();
