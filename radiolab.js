// Navigate to http://www.radiolab.org/archive/
// Paste in js console, execute
// Licensed under WTFPL

var seasons = $( ".archive" );
var episode_total = $( "#radiolab-archive-list li h4 a" ).length;
var processed_count = 0;
var lstore = {};

//"browser" downloads all through browser. "JSON" download json file {season:{episode_title:episode_download_link}}
var download_type = "browser"
// var download_type = "JSON"

// https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
// download string as file (JSON in this case)
function download( filename, text ) {
    var pom = document.createElement ( 'a' );
    pom.setAttribute( 'href', 'data:text/plain;charset=utf-8,' + encodeURIComponent ( text ) );
    pom.setAttribute( 'download', filename );
    pom.click();
}

// https://stackoverflow.com/questions/3916191/download-data-url-file
// tell browser to download file, fancy filenames will only work in certain browsers, otherwise get stock as served
function downloadURI ( uri, name ) {
  var link = document.createElement ( "a" );
  link.download = name;
  link.href = uri;
  link.click();
}

// downloads all files in lstore from browser
function download_from_browser() {
    $.each( lstore, function ( s_index, s_value ) {
        file_prefix_season = s_index;
        $.each( s_value, function ( e_index, e_value ) {
            file_prefix_episode = e_index;
            filename = ( file_prefix_season + file_prefix_episode ).replace ( " ", "_" ) + ".mp3";
            downloadURI ( e_value, filename );
        });
    });
}

function check_done() {
    processed_count += 1;
    if ( processed_count == episode_total ) {
        console.log ( 'done' );
        // convert to json and download or download through browser
        if ( download_type == "JSON" ) { 
            download ( 'radiolab_season_list.json', JSON.stringify ( lstore ) );
        } else {
            download_from_browser();
        }
    }
}

$.each ( seasons, function ( s_index, s_value) {
    var season_title = $('h1', s_value).text().trim();
    lstore[ season_title ] = {};
    var episodes = $( "#radiolab-archive-list li h4 a", s_value )
    $.each ( episodes, function ( index, value ) {
        var episode_url = $( value ).attr( "href" );
        $.get ( episode_url )
            .fail ( function ( data ) {
                console.log ( 'failed to fetch ' + episode_url );;
                check_done();
            })
            .success( function ( data ) {
                lstore[ season_title ] [ $(".story-headergroup .title", data ).text().trim() ] = $( ".inline_audioplayer_wrapper div,", data ).attr( "data-download" );
                check_done();
            });
});
});
