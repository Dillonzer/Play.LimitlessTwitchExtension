var token, userId, channelId, tournamentId, playerName;

function Tournament(name, organizer, format, round)
{
  this.Name = name;
  this.Organizer = organizer;
  this.Format = format;
  this.Round = round;
  this.RoundEnd = new Date(0);
  this.Ongoing = true;
}

function Player(name, deck, icons, decklist)
{
  this.Name = name;
  this.Deck = deck;
  this.Icons = icons;
  this.Decklist = decklist;
  this.Active = true;
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

function Match(completed, playerScore, oppScore)
{
  this.Completed = completed;
  this.PlayerScore = playerScore;
  this.OppScore = oppScore;
}

var tournamentObject, playerObject, opponentObject, decklistObject, matchObject
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
  configureExtension()

});

function configureExtension() {
    var settings = {
        "url": "https://dev-ptcg-api.herokuapp.com/playlimitless/values/"+channelId,
        "method": "GET",
        "timeout": 0,
      };
      
      $.ajax(settings).done(function (response) {
        console.log(response)
        tournamentId = response.tournamentID;
        playerName = response.playerID;

        getTournamentInformation()
        updateInformation()
      }); 
}

function openStandings()
{
  document.getElementById("currentStandings").style.display = "";
  document.getElementById("currentMatchInformation").style.display = "none";

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
    if(typeof response.player.deck !== 'undefined')
    {
      decklistObject = new Decklist(response.player.decklist.pokemon, response.player.decklist.trainer, response.player.decklist.energy)
      playerObject = new Player(response.player.name, response.player.deck.name, response.player.deck.icons, decklistObject)
    }
    else
    {
      playerObject = new Player(response.player.name,"","","")
    }

    setTournamentInformation()
  });
}

function getStandings()
{  
  standingsObject = []
  $.ajax({
    type: "GET",
    url: "https://play.limitlesstcg.com/ext/dillonzer/standings?tournamentId="+tournamentId,
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

function setTournamentInformation()
{
  document.getElementById("tournamentName").textContent = tournamentObject.Name
  document.getElementById("format").src = "https://play.limitlesstcg.com/img/formats/"+tournamentObject.Format.toLowerCase()+".png"
}

function updatePlayerInformation()
{  
  document.getElementById("playerName").textContent = playerObject.Name
  if(playerObject.Active)
  {
    document.getElementById("dropStatus").src = "./images/green_light.png"
  }
  else
  {
    document.getElementById("dropStatus").src = "./images/red_light.png"
  }
  if(tournamentObject.Ongoing)
  {
    document.getElementById("tournamentOngoing").src = "./images/green_light.png"
  }
  else
  {
    document.getElementById("tournamentOngoing").src = "./images/red_light.png"
  }
  document.getElementById("playerRecord").textContent = playerObject.Record
}

var timerFunction = function() {  
  if(typeof tournamentObject.RoundEnd != 'undefined')
  {
    var now = new Date().getTime();
    var roundEnd = tournamentObject.RoundEnd
    var timeleft = roundEnd - now;
    
    var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
    var stringSeconds = ""
    if(seconds.toString().length == 1)
    {
      stringSeconds = "0" + seconds
    }
    else
    {
      stringSeconds = seconds
    }

    document.getElementById("roundTimer").textContent = minutes + ":" + stringSeconds
    
    if (timeleft < 0) {
      clearInterval(timerFunction);    
      document.getElementById("roundTimer").textContent = "ROUND OVER"
      setInterval(updateInformation, 1000)
    }
  }
  
}

var updateInformation = function() {
  var settings = {
    "url": "https://play.limitlesstcg.com/ext/dillonzer/update?username="+playerName+"&tournamentId="+tournamentId,
    "method": "GET",
    "timeout": 0,
  };
  
  $.ajax(settings).done(function (response) {
    
    var currentRound = tournamentObject.Round
    if(currentRound != response.tournament.round)
    {
      tournamentObject.Round = response.tournament.round
      tournamentObject.Ongoing = response.tournament.ongoing
      tournamentObject.RoundEnd = new Date(response.tournament.roundEnd)
      if(typeof response.match.opponent.deck !== 'undefined')
      {
        decklistObject = new Decklist(response.match.opponent.decklist.pokemon, response.match.opponent.decklist.trainer, response.match.opponent.decklist.energy)
        opponentObject = new Player(response.match.opponent.name, response.match.opponent.deck.name, response.match.opponent.deck.icons, decklistObject)
      }
      else
      {
        opponentObject = new Player(response.match.opponent.name,"","","")
      }
      playerObject.Record = response.player.record.wins + "-" + response.player.record.losses + "-" + response.player.record.ties
      playerObject.Active = response.player.active
      matchObject = new Match(response.match.completed, response.match.playerScore, response.match.oppScore)
      updatePlayerInformation()
      setInterval(timerFunction, 1000)
      clearInterval(updateInformation)
    }
  });
}