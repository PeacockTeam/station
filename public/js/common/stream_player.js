
$().ready(function () {
	/* Initialize soundManager */
	soundManager.flashVersion = 9;
    soundManager.debugMode = false;
	
	/*
	StreamPlayer.setCallbacks({
		on_song_changed: function(song) {console.log(song);},
		on_position_changed: function(percent) { console.log(percent); }
	});
	*/
});

function aid2id(aid) {
	return "a" + aid;
}

var QueuedPlaybackLoader = (function() {

	var songs_queue = [],
		currently_loading_sound;

	function loadNextSong() {
		
		if (currently_loading_sound) {
			throw "Assertion failed: currently_loading_sound must be undefined";
			return;
		}
		
		var song = songs_queue.shift();

		if (song === undefined) {
			// No songs to load
			return;
		}
		
		if (soundManager.getSoundById(aid2id(song.aid)) !== undefined) {
			// Sound was loaded already
			loadNextSong();
			return;
		}
		
		currently_loading_sound = soundManager.createSound({
			id: aid2id(song.aid),
			url: song.url,
			volume: 100,
			autoLoad: true,
			stream: true,
			autoPlay: false,
			onload: function() {
				//console.log("loading finished");
				currently_loading_sound = undefined;
				loadNextSong();
			}
		});
		
		// Save song object to sound
		currently_loading_sound.song = song;
	}
	
	return {
		loadPlayback: function(playback) {
			
			// Reset songs queue with new playback
			songs_queue = [];
			playback.songs.forEach(function(song) {
				songs_queue.push(song);
			});

			if (currently_loading_sound !== undefined) {
				// Some sound is loading right now

				var next_song = songs_queue[0];
				if (next_song !== undefined) {
					if (aid2id(next_song.aid) == currently_loading_sound.id) {
						// Next song is loading at now. Ok, do nothing
						return;
					} else if (soundManager.getSoundById(aid2id(next_song.aid)) !== undefined) {
						// Next song was loaded already. Ok, do nothing
						return;
					} else {
						// First song in queue has bigger priority, cansel current song loading
						console.log("Canseling loading");
						currently_loading_sound.destruct();
						currently_loading_sound = undefined;
					}
				}
			}
			
			loadNextSong();
		}
	};
})();

var PlaybackPlayer = (function() {

	var songs_queue = [],
		currently_playing_sound;
	
	var callbacks = {
		on_song_changed: function() {},
		on_position_changed: function() {}
	}
		
	function stopPlaying() {
		console.log("stopPlaying()");
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
			console.log("No songs to play");
			stopPlaying();
			return;
		}
		
		var sound = soundManager.getSoundById(aid2id(current_song.aid));
		if (sound == undefined) {
			console.log("Sound not found, waiting for second...");
			setTimeout(updatePlaying, 1000);
			return;
		}
				
		var song_position_offset = now - current_song.start_time;
		
		if (currently_playing_sound !== undefined && currently_playing_sound.id == sound.id) {
			// Same sound is playing
			var offsetError = Math.abs(currently_playing_sound.position - song_position_offset);
						
			if (offsetError < 1000) {
				// Don't need to fix anything
				//console.log("Already playing: ", offsetError);
				return;
			} else {
				// OffsetError is to large, restart playing
				//console.log("Reset sound: ", offsetError);
			}
		}		
			
		stopPlaying();
						
		switch (sound.readyState) {
		case 1: // Loading
			if (sound.duration < song_position_offset + 5000) {
				console.log("Sound is still loading, waiting for second...");
				setTimeout(updatePlaying, 1000);
				return;
			}
			// Go ahead to case 3
					
		case 3: // Loaded
			console.log("Start playing song at: ", song_position_offset);
			sound.setPosition(song_position_offset);
			sound.play({
				onfinish: function() {
					updatePlaying();
				},
				
				whileplaying: function() {
					var position = currently_playing_sound.position,
						duration = currently_playing_sound.song.duration,
						percent = position / (duration * 1000.0);
										
					callbacks.on_position_changed(percent);
				}
			});
					
			currently_playing_sound = sound;
			
			// Notify observers about song change
			callbacks.on_song_changed(currently_playing_sound.song);
			break;
						
		case 2: // failed error
		case 0: // uninitialized
		default:
			console.log("Sound initialization failed, waiting for 5 seconds...");
			setTimeout(updatePlaying, 5000);
			return;
		}
	}
			
	return {
		play: function(playback) {
			songs_queue = [];
			playback.songs.forEach(function(song) {
				songs_queue.push(song);
			});
			
			updatePlaying();
		},
		
		stop: stopPlaying,
				
		isPlaying: function() {
			return currently_playing_sound !== undefined;
		},
		
		getPlayingSong: function() {
			if (!this.isPlaying()) {
				return undefined;
			}			
			return currently_playing_sound.song;
		},
		
		setCallbacks: function(cb) {
			callbacks = {
				on_song_changed: cb.on_song_changed || callbacks.on_song_changed,
				on_position_changed: cb.on_position_changed || callbacks.on_position_changed
			}
		}
	};
})();

var StreamPlayer = (function() {
	
	var callbacks = {
		on_stream_updated: function() {},
		on_stream_update_failed: function() {}
	};
	
	var playing_stream_id,
		is_stream_update_scheduled = false;
	
	/* Syncronize by client-server time offset */
	function fixPlaybackTime(playback, server_time, local_time) {
		var time_offset = local_time - server_time;
		playback.songs.forEach(function(song) {
			song.start_time += time_offset;
			song.stop_time += time_offset;
		});
	}
	
    return {
		playStream: function(stream_id, callback) {
			
			var before_request_time = new Date().getTime();
			
			StreamClient.getPlayback({stream_id: stream_id}, function(playback) {
				
				var after_request_time = new Date().getTime();

				if (playback) {

					var local_time = (before_request_time + after_request_time) / 2;
					fixPlaybackTime(playback, playback.server_time, local_time);
					
					QueuedPlaybackLoader.loadPlayback(playback);
					PlaybackPlayer.play(playback);
					
					playing_stream_id = stream_id;
					
					callbacks.on_stream_updated();
					
				} else {
					console.log("No playback received");
					StreamPlayer.stopPlaying();
					
					playing_stream_id = undefined;
					
					callbacks.on_stream_update_failed();
				}
				
				if (playing_stream_id !== undefined && !is_stream_update_scheduled) {
					setTimeout(StreamPlayer.updateStream, 30000); // Update every 30 seconds
					is_stream_update_scheduled = true;			
				}
			});
		},
		
		updateStream: function() {
			is_stream_update_scheduled = false;
			if (playing_stream_id !== undefined) {
				StreamPlayer.playStream(playing_stream_id);
			}
		},
		
		stopPlaying: function() {
			playing_stream_id = undefined;
			PlaybackPlayer.stop();
		},
		
		getStreamID: function() {
			return playing_stream_id;
		},
		
		isPlaying: function() {
			return PlaybackPlayer.isPlaying();
		},
		
		getPlayingSong: function() {
			return PlaybackPlayer.getPlayingSong();
		},
		
		setCallbacks: function(cb) {
			
			PlaybackPlayer.setCallbacks(cb);
			
			callbacks = {
				on_stream_updated: cb.on_stream_updated || callbacks.on_stream_updated,
				on_stream_update_failed: cb.on_stream_update_failed || callbacks.on_stream_update_failed
			};
		}
    };
})();
