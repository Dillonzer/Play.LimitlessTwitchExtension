var token, userId, channelId, tournamentId, playerName;

function Tournament(name, organizer, format)
{
  this.Name = name;
  this.Organizer = organizer;
  this.Format = format;
}

function Player(name, deck, icons, decklist)
{
  this.Name = name;
  this.Deck = deck;
  this.Icons = icons;
  this.Decklist = decklist;
}

function Decklist(pokemon, trainers, energy)
{
  this.Pokemon = pokemon;
  this.Trainers = trainers;
  this.Energy = energy;
}

function Standings(placing, username, name, country, points, record, deck, icons)
{
  this.Placing = placing;
  this.Username = username;
  this.Name = name;
  this.Country = country;
  this.Points = points;
  this.Record = record;
  this.Deck = deck;
  this.Icons = icons;
}

var tournamentObject, playerObject, decklistObject
var standingsObject = [];

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
  document.getElementById("about").style.display = "";
  document.getElementById("currentStandings").style.display = "none";
  document.getElementById("currentMatchInformation").style.display = "none";
  document.getElementById("streamersMatches").style.display = "none";  
}

function openStandings()
{
  document.getElementById("about").style.display = "none";
  document.getElementById("currentStandings").style.display = "";
  document.getElementById("currentMatchInformation").style.display = "none";
  document.getElementById("streamersMatches").style.display = "none";  

  getStandings()
}

function getTournamentInformation() {
  var settings = {
    "url": "https://play.limitlesstcg.com/ext/dillonzer/init?username="+playerName+"&tournamentId="+tournamentId,
    "method": "GET",
    "timeout": 0,
  };
  
  $.ajax(settings).done(function (response) {
    tournamentObject = new Tournament(response.tournament.name, response.tournament.organizer, response.tournament.format)
    decklistObject = new Decklist(response.player.decklist.pokemon, response.player.decklist.trainer, response.player.decklist.energy)
    playerObject = new Player(response.player.name, response.player.deck.name, response.player.deck.icons, decklistObject)
  });
}

function getStandings()
{  
  standingsObject = []
  $.ajax({
    type: "GET",
    url: "https://play.limitlesstcg.com/ext/dillonzer/standings?tournamentId=5ff5d4134a35987a4d79faec",//+tournamentId,
    success: function(data) {
    if( data.length ) {
          for( item in data ) {
            record = data[item].record.wins + " - " + data[item].record.losses + " - " + data[item].record.ties
              standingsObject.push(new Standings(data[item].placing, data[item].username, data[item].name, data[item].country, data[item].record.points, record, data[item].deck.name, data[item].deck.icons))
          }
          $("#standingsTable tr").remove(); 
          createStandings()
      }
    }
  })
}

function createStandings()
{
  let table = document.getElementById("standingsTable")
  let titles = ["Placing", "Username", "Name", "Country", "Points", "Record", "Deck", ""]
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of titles) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
  
  for (let element of standingsObject) {
    let row = table.insertRow();
    for (let key in element) {
      if(key == "Icons")
      {
        let cell = row.insertCell();
        for(let image in element[key])
        {
          var img = document.createElement("img");
          img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+element[key][image]+".png"
          cell.appendChild(img)
          
        }
      }
      else
      {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
}