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
          if(element[key][image] === "substitute")
          {
            img.src = "https://play.limitlesstcg.com/img/"+element[key][image]+".png"
          }
          else
          {         
            img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+element[key][image]+".png"
          }
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
    
    if (timeleft <= 0) {
      clearInterval(timerFunction);    
      document.getElementById("roundTimer").textContent = "ROUND OVER"
      updateInformation()
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
      if(response.tournament.roundEnd != null)
      {
        tournamentObject.RoundEnd = new Date(response.tournament.roundEnd)
      }
      if(response.match != null)
      {
        if(typeof response.match.opponent.deck !== 'undefined')
        {
          decklistObject = new Decklist(response.match.opponent.decklist.pokemon, response.match.opponent.decklist.trainer, response.match.opponent.decklist.energy)
          opponentObject = new Player(response.match.opponent.name, response.match.opponent.deck.name, response.match.opponent.deck.icons, decklistObject)
        }
        else
        {
          opponentObject = new Player(response.match.opponent.name,"","","")
        }
        
        matchObject = new Match(response.match.completed, response.match.playerScore, response.match.oppScore)
      }
      playerObject.Record = response.player.record.wins + "-" + response.player.record.losses + "-" + response.player.record.ties
      playerObject.Active = response.player.active
      updatePlayerInformation()
      if(response.tournament.roundEnd != null)
      {
        tournamentObject.RoundEnd = new Date(response.tournament.roundEnd)
        setInterval(timerFunction, 1000)
      }
      else
      {        
        document.getElementById("roundTimer").textContent = "NO ROUND TIMER ANYMORE"
      }
      //clearInterval(updateInformation)
    }
  });
}

function openMatchInformation()
{  
  document.getElementById("currentStandings").style.display = "none";
  document.getElementById("currentMatchInformation").style.display = "";

  getMatchInformation()
}

function getMatchInformation()
{
  if(typeof matchObject != 'undefined')
  {
    document.getElementById("playersMatchUsername").textContent = playerObject.Name
    document.getElementById("opponentsMatchUsername").textContent = opponentObject.Name

    if(typeof playerObject.Decklist != 'undefined')
    {
      for(image in playerObject.Icons)
      {
        var img = document.createElement("img");
        img.style.paddingLeft = "5px"
        if(playerObject.Icons[image] === "substitute")
        {
          img.src = "https://play.limitlesstcg.com/img/"+playerObject.Icons[image]+".png"
        }
        else
        {         
          img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+playerObject.Icons[image]+".png"
        }

        document.getElementById("playersMatchUsername").appendChild(img)

      }
      createDecklistTable(playerObject.Decklist.Pokemon, "playersPokemon", "Pokemon")
      createDecklistTable(playerObject.Decklist.Trainers, "playersTrainers", "Trainers")
      createDecklistTable(playerObject.Decklist.Energy, "playersEnergy", "Energy")
    }

    if(typeof opponentObject.Decklist != 'undefined')
    {
      
      for(image in opponentObject.Icons)
      {
        var img = document.createElement("img");
        img.style.paddingLeft = "5px"
        if(opponentObject.Icons[image] === "substitute")
        {
          img.src = "https://play.limitlesstcg.com/img/"+opponentObject.Icons[image]+".png"
        }
        else
        {         
          img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+opponentObject.Icons[image]+".png"
        }

        document.getElementById("opponentsMatchUsername").appendChild(img)

      }
      
      createDecklistTable(opponentObject.Decklist.Pokemon, "opponentsPokemon", "Pokemon")
      createDecklistTable(opponentObject.Decklist.Trainers, "opponentsTrainers", "Trainers")
      createDecklistTable(opponentObject.Decklist.Energy, "opponentsEnergy", "Energy")
      
    }
  }
}

function createDecklistTable(pokemon, tableName, title)
{
  let table = document.getElementById(tableName)
  let titles = [title]
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of titles) {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
  
  for (let element of pokemon) {
    let row = table.insertRow();
    let text = document.createTextNode(element.count+" - "+element.name+" ("+element.set+" "+element.number+")")
    let cell = row.insertCell();
    cell.appendChild(text);
  }
}