$(function() {
    $("#album, #playlist").sortable({
        connectWith: ".connectedSortable"
    });
    
    $('#main_view').hide();
});

var View = (function() {

    $(function () {
        $("#playlist").bind("sortremove", function(event, ui) {
            clearIfSelected(ui.item); 
        });
    });

    function getUnicSongID(song) {
        return song.aid + song.owner_id;
    }
    
    function setSelection(li) {
        li.parent().children().each(function(i, e) {
            clearIfSelected(e);
        });
        li.toggleClass("ui-state-default ui-state-highlight");
    }

    function clearIfSelected(li) {
        var e = $(li); 
        if (e.hasClass('ui-state-highlight')) {
            e.toggleClass("ui-state-default ui-state-highlight");
        }
    }

    function addSong(component, song) {
        var templ = _.template("<li> <b><%= artist %></b> <span> - <%= title %> </span> </li>");
        var li = $(templ(song))
            .data("song", song)
            .attr("id", getUnicSongID(song))
            .addClass("ui-state-default");
        $(component).append(li);
    }
    
    return {
        toggleMainView: function() {
             $('#login_view').hide();
             $('#main_view').show();
        },

        setAlbumTracks: function(songs) {
            songs.forEach(function(song) {
                addSong('#album', song);
            });
        },

        setPlaylist: function(songs) {
            songs.forEach(function(song) {
                addSong('#playlist', song);
            });
        },

        selectSong: function(song) {
            var li = $('#' + getUnicSongID(song));
            console.log(li);
            setSelection(li);
        },

        onPlaylistClicked: function(handlers) {
            $('#album li, #playlist li').click(function(e) {
                var li = $(this),
                    song = li.data("song");

                // only for songs currently in playlist
                if (li.parent().attr("id") == 'playlist') {
                    
                    if (li.hasClass("ui-state-highlight")) {
                        // song unselected
                        handlers.on_unselect(song, function() {
                            li.toggleClass("ui-state-default ui-state-highlight");
                        });
                    } else {
                        // song selected
                        handlers.on_select(song, function() {
                            setSelection(li);
                        });
                    }
                }
            }); 
        },

        onPlaylistChanged: function(handler) {
            $("#playlist").bind("sortupdate", function(event, ui) {
                var songs = [];
                $(this).children().each(function(i, e) {
                    songs.push($(e).data("song"));
                });
                handler(songs);
            });
        }

    };
})();
