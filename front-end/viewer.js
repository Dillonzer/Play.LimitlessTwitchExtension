var token, userId, channelId, tournamentId, playerName;

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
        tournamentId = response.tournamentID;
        playerName = response.playerID;
      }); 
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

function openAbout() 
{
  configureExtension()
  document.getElementById("about").style.display = "";
  document.getElementById("currentStandings").style.display = "none";
  document.getElementById("currentMatchInformation").style.display = "none";
  document.getElementById("streamersMatches").style.display = "none";
  
}