var streamPlayback = require('./stream_manager.js').streamPlayback;


var playlist1 = [
    {
        aid: 1,
        duration: 10
    },
    {
        aid: 2,
        duration: 10
    },
    {
        aid: 3,
        duration: 10
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


var stream = {
    playlist: playlist1
};

streamPlayback.startPlaying(stream, 2, 100 * 1000);


console.log(stream);

console.log(streamPlayback.getPlayback(stream, 200 * 1000 ));




