
var token, userId, channelId;

window.Twitch.ext.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  channelId = auth.channelId
});

window.onload = function()
{
  EventHandlers()   
}

function EventHandlers() {  
  document.getElementById("loadTournaments").addEventListener("click",function() {LoadTournaments()})
  document.getElementById("submit").addEventListener("click",function() {Submit()})
}

function Submit() {
  var username = $("#playerName").val()      
  var tournament = $("#tournamentId").val()

  var settings = {
    "url": "https://dev-ptcg-api.herokuapp.com/playlimitless/upsert/"+tournament+"/"+username+"/"+channelId,
    "method": "POST",
    "timeout": 0,
  };
  
  $.ajax(settings).done(function (response) {
    document.getElementById("success").textContent = "SUCCESS!"
  });
}

function LoadTournaments(){
  document.getElementById("success").textContent = ""
  var username = $("#playerName").val()  
  var select = $('#tournamentId');
  
  $.ajax({
    type: "GET",
    url: "https://play.limitlesstcg.com/ext/dillonzer/registrations?username="+username,
    success: function(data) {
    var htmlOptions = [];
    if( data.length ) {
          for( item in data ) {
              html = '<option value="' + data[item].id + '">' + data[item].name + '</option>';
          htmlOptions[htmlOptions.length] = html;
          }

          select.empty().append( htmlOptions.join('') );
          $('#submit').prop('disabled', false);
      }
    },
    error: function(error) {
        alert(error.responseJSON.message);
    }
      })
}