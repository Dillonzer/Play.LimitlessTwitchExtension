function updateOptions() {
    $('$tournament_iframe').empty();
    $('$tournament_iframe').append($('<iframeframeborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px;background-color: white;" height="100%" width="100%" ></iframe>').src(options[0]));
    
}