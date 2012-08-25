
//object:SMSound onPosition(id:string, msecOffset:integer, callback:function, [scope])
//object:SMSound setPosition(id:string,msecOffset:integer)

//object:SMSound play(id:string, [options object])
//object:SMSound stop(id:string)

$().ready(function () {
	console.log("init soundManager");

	soundManager.setup({
		url: '.',  
		flashVersion: 9,
		onready: function() {
			onsole.log("soundManager is ready");
		},
		ontimeout: function() {
			console.log("ontimeout");
		}
	});	
});

var QueuedPlaybackLoader = (function() {

	var songs_queue = [],
		currently_loading_sound;

	function loadNextSong() {
		
		if (currently_loading_sound) {
			throw "Assertion failed: currenty_loading_sound must be undefined";
		}
		
		var song = songs_queue.shift();

		if (song == undefined) {
			// No songs in queue, return
			return;
		}
		
		console.log("Loading song: " + song.aid);
		
		if (soundManager.getSoundById("a" + song.aid)) {
			// If sound was loaded already
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
				if (next_song && currently_loading_sound.id == next_song.aid) {
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
	var currenty_playing_sound;
		
	function stopPlaying() {
		if (currently_playing_sound) {
			currently_playing_sound.stop();
			currently_playing_sound = undefined;
		}
	}

	function updatePlaying() {

		var now = new Date().getTime();
		
		var current_song = _.find(songs_queue, function(song) {
			return song.start_time <= now && now < song.end_time;
		});
		
		if (current_song == undefined) {
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
		
		if (currently_playing_sound) {
			if (currently_playing_sound.id == sound.id) {
				// Same sound playing. OK, just check restrictions
				
			} else {
				stopPlaying();
					
				var song_position_offset = now - current_song.start_time;
					
				switch (sound.readyState) {
				case 1: // loading
					if (sound.duration < song_position_offset + 5000) {
						console.log("Sound is still loading, waiting for second...");
						setTimeout(updatePlaying, 1000);
					}
					
				case 3: // loaded
					sound.play({
						from: song_position_offset,
						onstop: function() {
							updatePlaying();
						}					
					});
					
					currenty_playing_sound = sound;		
					break;
						
				case 2: // failed error
				case 0: // uninitialized
				default:
					console.log("Failed to get sound, waiting for 5 seconds...");
					setTimeout(updatePlaying, 5000);
					return;
				}					
			}
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
});

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
