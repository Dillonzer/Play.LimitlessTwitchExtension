
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
  document.getElementById("casterMode").addEventListener("change",function() {ToggleCasterMode()})
}

function Submit() {
  var username = $("#playerName").val()      
  var tournament = $("#tournamentId").val()
  var casterMode =  document.getElementById("casterMode")

  if(username == "" && casterMode.checked)
  {
    username = "null"
  }
  else
  {    
    document.getElementById("success").style.color = "red"
    document.getElementById("success").textContent = "Please enter a username!"
  }

  if(casterMode.checked)
  {
    casterMode = "true"
  }
  else
  {
    casterMode = "false"
  }

  var settings = {
    "url": "https://ptcg-api.herokuapp.com/playlimitless/upsert/"+tournament+"/"+username+"/"+channelId+"/"+casterMode,
    "method": "POST",
    "timeout": 0,
  };
  
  $.ajax(settings).done(function (response) {
    document.getElementById("success").style.color = "green"
    document.getElementById("success").textContent = "SUCCESS!"
  });
}

function LoadTournaments(){
  document.getElementById("success").textContent = ""
  var username = $("#playerName").val()  
  var select = $('#tournamentId');
  select.empty()
  var url = "https://play.limitlesstcg.com/ext/dillonzer/registrations?username="+username

  if(document.getElementById("casterMode").checked)
  {
    url = "https://play.limitlesstcg.com/ext/live/tournaments"
  }
  
  $.ajax({
    type: "GET",
    url: url,
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

function ToggleCasterMode(){
  if (document.getElementById("casterMode").checked) {
    document.getElementById("noCasterMode").style.display = "none";
  } else {
    document.getElementById("noCasterMode").style.display = "";
  }
}