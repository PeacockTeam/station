var streamPlayback = require('./stream_manager.js').streamPlayback;


var playlist1 = [
    {
        aid: 1,
        duration: 5 
    },
    {
        aid: 2,
        duration: 10
    },
    {
        aid: 3,
        duration: 15
    },
    {
        aid: 4,
        duration: 10
    }
];

var playlist2 = [
    {
        aid: 5,
        duration: 10
    },
    {
        aid: 3,
        duration: 10
    },
    {
        aid: 6,
        duration: 10
    },
    {
        aid: 7,
        duration: 10
    },
    {
        aid: 8,
        duration: 10
    }
];

var playlist3 = [
];


var stream = {
    playlist: playlist1
};

streamPlayback.startPlaying(stream, 2, 100 * 1000);
console.log(stream);
console.log(streamPlayback.getPlayback(stream, 234 * 1000 ));

streamPlayback.updateActivePlaylist(stream, playlist3, 235 * 1000); 
console.log(stream);
console.log(streamPlayback.getPlayback(stream, 236 * 1000 ));





