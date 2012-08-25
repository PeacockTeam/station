
$().ready(function () {
	soundManager.flashVersion = 9;
    soundManager.debugMode = false;
});

var QueuedPlaybackLoader = (function() {

	var songs_queue = [],
		currently_loading_sound;

	function loadNextSong() {
		
		if (currently_loading_sound) {
			throw "Assertion failed: currently_loading_sound must be undefined";
		}
		
		var song = songs_queue.shift();

		if (song == undefined) {
			// No songs in queue, return
			return;
		}
		
		if (soundManager.getSoundById("a" + song.aid) !== undefined) {
			// If sound was loaded already
			console.log("Sound already loaded");
			loadNextSong();
		}
		
		currently_loading_sound = soundManager.createSound({
			id: "a" + song.aid,
			url: song.url,
			volume: 100,
			autoLoad: true,
			stream: true,
			autoPlay: false,
			onload: function() {
				console.log("onload() called");
				currently_loading_sound = undefined;
				loadNextSong();
			}
		});
	}
	
	return {
		loadPlayback: function(playback) {
			
			// Reset songs queue with new playback
			songs_queue = [];
			playback.songs.forEach(function(song) {
				songs_queue.push(song);
			});
			
			if (currently_loading_sound) {
				
				var next_song = songs_queue[0];
				if (next_song !== undefined && next_song.aid == currently_loading_sound.id) {
					// Next song is already loading. Ok, do nothing
					return;
				} else {
					// Cansel current song loading
					currently_loading_sound.destruct();
					currently_loading_sound = undefined;	
				}
			}
			
			loadNextSong();
		}
	};
})();

var PlaybackPlayer = (function() {

	var songs_queue = [];
	var currently_playing_sound;
		
	function stopPlaying() {
		if (currently_playing_sound) {
			currently_playing_sound.stop();
			currently_playing_sound = undefined;
		}
	}

	function updatePlaying() {

		console.log("updatePlaying()");
	
		var now = new Date().getTime();
		
		var current_song = _.find(songs_queue, function(song) {
			return song.start_time <= now && now < song.stop_time;
		});
		
		if (current_song == undefined) {
			console.log("No songs in queue, stop playing");
			// No songs in queue, return
			stopPlaying();
			return;
		}
		
		var sound = soundManager.getSoundById("a" + current_song.aid);
		if (sound == undefined) {
			console.log("Failed to get sound, waiting for second...");
			setTimeout(updatePlaying, 1000);
			return;
		}
		
		console.log("currently_playing_sound: ", currently_playing_sound);
		
		var song_position_offset = now - current_song.start_time;
		
		if (currently_playing_sound != undefined && currently_playing_sound.id == sound.id) {
			// Same sound playing
			var offsetError = Math.abs(currently_playing_sound.position - song_position_offset);
			
			console.log("Offset error: ", offsetError);
			console.log(currently_playing_sound.position, song_position_offset);
			
			if (offsetError < 1000) {
				// Don't need to fix anything
				return;
			} else {
				// OffsetError is to large, start again to fix it
			}
		}			
			
		stopPlaying();
						
		switch (sound.readyState) {
		case 1: // loading
			//console.log("Loading: ", sound.duration, song_position_offset + 5000);
			if (sound.duration < song_position_offset + 5000) {
				console.log("Sound is still loading, waiting for second...");
				setTimeout(updatePlaying, 1000);
				return;
			}
			// Go ahead to case 3
					
		case 3: // loaded
			console.log("Start playing song at: ", song_position_offset);
			sound.setPosition(song_position_offset);
			sound.play({
				onfinish: function() {
					console.log("onstop() called");
					updatePlaying();
				}
			});
					
			currently_playing_sound = sound;		
			break;
						
		case 2: // failed error
		case 0: // uninitialized
		default:
			console.log("Failed to get sound, waiting for 5 seconds...");
			setTimeout(updatePlaying, 5000);
			return;
		}					
	}
			
	return {
		playPlayback: function(playback) {
			songs_queue = [];
			playback.songs.forEach(function(song) {
				songs_queue.push(song);
			});
			
			updatePlaying();
		},
		
		stopPlaying: stopPlaying
	};
})();

var StreamPlayer = (function() {
	
	function fixPlaybackTime(playback, server_time, local_time) {
		var time_offset = local_time - server_time;
		playback.songs.forEach(function(song) {
			song.start_time += time_offset;
			song.stop_time += time_offset;
		});
		
		console.log("Server time: " + server_time);
		console.log("Local time: " + local_time);
	}
	
    return {
		playStream: function(stream_id) {
			
			var before_request_time = new Date().getTime();
			
			StreamClient.getPlayback({stream_id: stream_id}, function(playback) {
				
				var after_request_time = new Date().getTime();

				if (playback) {

					var local_time = (before_request_time + after_request_time) / 2;
					fixPlaybackTime(playback, playback.server_time, local_time);			
					
					QueuedPlaybackLoader.loadPlayback(playback);
					PlaybackPlayer.playPlayback(playback);
				} else {
					console.log("No playback received");
					this.stopPlaying();
				}
			});
		},
				
		stopPlaying: function() {
			PlaybackPlayer.stopPlaying();
		}
    };
})();
