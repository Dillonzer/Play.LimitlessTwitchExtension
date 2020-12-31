
var token, userId, channelId;

window.Twitch.ext.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  channelId = auth.channelId
});

$(function(){
  $("#form").submit(function(e){
      e.preventDefault()
      tournament_url = $("#tournament_url").val()
      player_url = $("#player_url").val()

      var settings = {
        "url": "https://dev-ptcg-api.herokuapp.com/playlimitless/upsert/"+tournament_url+"/"+player_url+"/"+channelId,
        "method": "POST",
        "timeout": 0,
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
  })
})