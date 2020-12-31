var token, userId, channelId;

// so we don't have to write this out everytime 
const twitch = window.Twitch.ext;

// onContext callback called when context of an extension is fired 
twitch.onContext((context) => {
  console.log(context);
});

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  channelId = auth.channelId;
});

function configureExtension() {
    var settings = {
        "url": "https://dev-ptcg-api.herokuapp.com/playlimitless/values/"+channelId,
        "method": "GET",
        "timeout": 0,
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });

   // $('$tournament_iframe').empty();
   // $('$tournament_iframe').append($('<iframeframeborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px;background-color: white;" height="100%" width="100%" ></iframe>').src(options[0]));
    
}