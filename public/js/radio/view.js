$(function() {
    $('#main_view').hide();
});

var View = {
    toggleMainView: function() {
         $('#login_view').hide();
         $('#main_view').show();
    },

    setCurrentSong: function (song) {
        var templ = _.template("<b><%= artist %></b> <span> - <%= title %> </span>");
        $("#song-block").html(templ(song));
    }
};
