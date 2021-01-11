var token, userId, channelId, tournamentId, playerName, channelHasTournament;

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

function Standings(placing, name, country, points, record, deck, icons)
{
  this.Placing = placing;
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

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  channelId = auth.channelId;
  configureExtension()

});

window.onload = function()
{
  EventHandlers()   
}

function EventHandlers() {
    document.getElementById("standingsLink").addEventListener("click",function() {openStandings()})
    document.getElementById("matchOpenLink").addEventListener("click",function() {openMatchInformation()})
    document.getElementById("manualRefresh").addEventListener("click",function() {configureExtension()})
    document.getElementById("aboutPageLink").addEventListener("click", function() {openAboutPage()})
}

function configureExtension() {  
  $.ajax({
    type: "GET",
    url: "https://ptcg-api.herokuapp.com/playlimitless/values/"+channelId,
    success: function(data) {
      tournamentId = data.tournamentID;
      playerName = data.playerID;

      if(typeof tournamentId != 'undefined')
      {
        channelHasTournament = true;
      }
      else
      {        
        channelHasTournament = false;
      }

      getTournamentInformation()
      updateInformation()
    },
    error: function() {
      channelHasTournament = false;
    }
  })
}

function openAboutPage(){  
  document.getElementById("currentStandings").style.display = "none";
  document.getElementById("currentMatchInformation").style.display = "none";
  document.getElementById("droppedout").style.display = "none";    
  document.getElementById("nostandings").style.display = "none";   
  document.getElementById("nomatches").style.display = "none";  
  document.getElementById("aboutPage").style.display = ""; 
}

function openStandings()
{
  if(channelHasTournament)
  {
    getStandings()
    document.getElementById("currentStandings").style.display = "";
    document.getElementById("currentMatchInformation").style.display = "none";
    document.getElementById("droppedout").style.display = "none";    
    document.getElementById("nostandings").style.display = "none";   
    document.getElementById("nomatches").style.display = "none"; 
    document.getElementById("aboutPage").style.display = "none"; 

  }
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
      playerObject = new Player(response.player.name,undefined,undefined,undefined)
    }

    setTournamentInformation()
  });
}

function getStandings()
{  
  $("#standingsTable tr").remove(); 
  standingsObject = []
  $.ajax({
    type: "GET",
    url: "https://play.limitlesstcg.com/ext/dillonzer/standings?tournamentId="+tournamentId,
    success: function(data) {
    if( data.length ) {
          for( item in data ) {
            record = data[item].record.wins + " - " + data[item].record.losses + " - " + data[item].record.ties
            if(typeof data[item].deck != 'undefined')
            {
              standingsObject.push(new Standings(data[item].placing, data[item].name, data[item].country, data[item].record.points, record, data[item].deck.name, data[item].deck.icons))
            }
            else
            {
              standingsObject.push(new Standings(data[item].placing, data[item].name, data[item].country, data[item].record.points, record, "N/A", ""))
            }
          }
          createStandings()
      }
    },
    error: function() {
      showNoStandings()
    }
  })
}

function createStandings()
{
  let table = document.getElementById("standingsTable")
  let titles = ["Placing", "Name", "Country", "Points", "Record", "Deck", ""]
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
      let cell = row.insertCell();
      if(key == "Icons")
      {
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
      else if (key == "Country" && element[key] != null)
      {
        var img = document.createElement("img");
        img.style.paddingLeft = "5px"
        img.src = "https://play.limitlesstcg.com/img/flags/"+element[key]+".png"
        cell.appendChild(img)
      } 
      else
      {
        let text = document.createTextNode("");
        if(element[key] != null)
        {
          text = document.createTextNode(element[key]);
        }
        
        cell.appendChild(text);
      }
    }
  }
}

function showNoStandings()
{
  document.getElementById("currentStandings").style.display = "none";
  document.getElementById("currentMatchInformation").style.display = "none";
  document.getElementById("droppedout").style.display = "none";    
  document.getElementById("nostandings").style.display = "";     
  document.getElementById("nomatches").style.display = "none"; 
  document.getElementById("aboutPage").style.display = "none";  
}

function setTournamentInformation()
{
  document.getElementById("tournamentName").textContent = tournamentObject.Name
  var imageUrl = "https://play.limitlesstcg.com/img/formats/"+tournamentObject.Format.toLowerCase()+".png"
  checkImage(imageUrl, function(){ document.getElementById("format").src = imageUrl}, function(){ document.getElementById("format").removeAttribute = "src"} );
}

function checkImage (src, good, bad) {
  var img = new Image();
  img.onload = good; 
  img.onerror = bad;
  img. src = src;
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
    var currentRound = tournamentObject.Round
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

    document.getElementById("roundTimer").textContent = "Round: " + currentRound + " - "+ minutes + ":" + stringSeconds
    
    if (timeleft <= 0) {
      clearInterval(timerFunction);    
      document.getElementById("roundTimer").textContent = "ROUND OVER"
      //updateInformation() - Robin didn't want this
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
    
    tournamentObject.Round = response.tournament.round
    tournamentObject.Ongoing = response.tournament.ongoing
    if(response.tournament.roundEnd != null)
    {
      tournamentObject.RoundEnd = new Date(response.tournament.roundEnd)
    }
    if(response.match != null && typeof response.match.opponent != 'undefined')
    {
        if(typeof response.match.opponent.deck != 'undefined')
        {
          decklistObject = new Decklist(response.match.opponent.decklist.pokemon, response.match.opponent.decklist.trainer, response.match.opponent.decklist.energy)
          opponentObject = new Player(response.match.opponent.name, response.match.opponent.deck.name, response.match.opponent.deck.icons, decklistObject)
        }
        else
        {
          opponentObject = new Player(response.match.opponent.name,undefined,undefined,undefined)
        }
        
        matchObject = new Match(response.match.completed, response.match.playerScore, response.match.oppScore)
      
    }
    else
    {
      matchObject = undefined
    }
    
    playerObject.Record = response.player.record.wins + "-" + response.player.record.losses + "-" + response.player.record.ties
    playerObject.Active = response.player.active
    updatePlayerInformation()

    if(response.tournament.roundEnd != null)
    {
      tournamentObject.RoundEnd = new Date(response.tournament.roundEnd)
      clearInterval(timerFunction)
      setInterval(timerFunction, 1100)
    }
    else
    {        
      document.getElementById("roundTimer").textContent = "Round " + tournamentObject.Round
    }
    getStandings()
    getMatchInformation()
  });
}

function openMatchInformation()
{  
  if(channelHasTournament)
  {
    updateInformation()
    if(!playerObject.Active)
    {
      document.getElementById("currentStandings").style.display = "none";
      document.getElementById("currentMatchInformation").style.display = "none";
      document.getElementById("droppedout").style.display = "";      
      document.getElementById("nostandings").style.display = "none";   
      document.getElementById("nomatches").style.display = "none";  
      document.getElementById("aboutPage").style.display = "none"; 
    }
    else
    {
      document.getElementById("currentStandings").style.display = "none";
      document.getElementById("currentMatchInformation").style.display = "";
      document.getElementById("droppedout").style.display = "none";     
      document.getElementById("nostandings").style.display = "none";    
      document.getElementById("nomatches").style.display = "none";  
      document.getElementById("aboutPage").style.display = "none"; 

      getMatchInformation()
    }
  }

}

function getMatchInformation()
{
  $("#opponentsPokemon tr").remove(); 
  $("#opponentsTrainers tr").remove(); 
  $("#opponentsEnergy tr").remove(); 
  $("#playersPokemon tr").remove(); 
  $("#playersTrainers tr").remove(); 
  $("#playersEnergy tr").remove(); 
  $('.decklistImagesForMatches').remove();
  document.getElementById("playersMatchUsername").textContent = null
  document.getElementById("opponentsMatchUsername").textContent = null

  if(typeof matchObject != 'undefined' && matchObject != "")
  {
    document.getElementById("playersMatchUsername").textContent = playerObject.Name + " - Score: " + matchObject.PlayerScore
    document.getElementById("opponentsMatchUsername").textContent = opponentObject.Name + " - Score: " + matchObject.OppScore

    if(typeof playerObject.Decklist != 'undefined')
    {
      for(image in playerObject.Icons)
      {
        var img = document.createElement("img");
        img.className = "decklistImagesForMatches"
        img.style.paddingLeft = "5px"
        if(playerObject.Icons[image] === "substitute")
        {
          img.src = "https://play.limitlesstcg.com/img/"+playerObject.Icons[image]+".png"
        }
        else
        {         
          img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+playerObject.Icons[image]+".png"
        }

        document.getElementById("playersMatchLogo").appendChild(img)

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
        img.className = "decklistImagesForMatches"
        img.style.paddingLeft = "5px"
        if(opponentObject.Icons[image] === "substitute")
        {
          img.src = "https://play.limitlesstcg.com/img/"+opponentObject.Icons[image]+".png"
        }
        else
        {         
          img.src = "https://play.limitlesstcg.com/img/pokemon-1.2/"+opponentObject.Icons[image]+".png"
        }

        document.getElementById("opponentsMatchLogo").appendChild(img)

      }
      
      createDecklistTable(opponentObject.Decklist.Pokemon, "opponentsPokemon", "Pokemon")
      createDecklistTable(opponentObject.Decklist.Trainers, "opponentsTrainers", "Trainers")
      createDecklistTable(opponentObject.Decklist.Energy, "opponentsEnergy", "Energy")
      
    }

    if(document.getElementById("droppedout").getAttribute("style")==null ||
      document.getElementById("nomatches").getAttribute("style")==null)
      {
        document.getElementById("currentStandings").style.display = "none";
        document.getElementById("currentMatchInformation").style.display = ""; 
        document.getElementById("nostandings").style.display = "none";   
        document.getElementById("droppedout").style.display = "none";     
        document.getElementById("nomatches").style.display = "none";  
        document.getElementById("aboutPage").style.display = "none";  
      }

  }
  else
  {
    if(document.getElementById("currentMatchInformation").getAttribute("style")==null ||
      document.getElementById("droppedout").getAttribute("style")==null ||
      document.getElementById("nomatches").getAttribute("style")==null)
      {
        if(playerObject.Active)
        {
          document.getElementById("currentStandings").style.display = "none";
          document.getElementById("currentMatchInformation").style.display = "none"; 
          document.getElementById("nostandings").style.display = "none";   
          document.getElementById("droppedout").style.display = "none";     
          document.getElementById("nomatches").style.display = "";  
          document.getElementById("aboutPage").style.display = "none";  
        }
        else
        {
          document.getElementById("currentStandings").style.display = "none";
          document.getElementById("currentMatchInformation").style.display = "none"; 
          document.getElementById("nostandings").style.display = "none";   
          document.getElementById("droppedout").style.display = "";     
          document.getElementById("nomatches").style.display = "none";  
          document.getElementById("aboutPage").style.display = "none";  
        }
      }

  }
}

function createDecklistTable(pokemon, tableName, title)
{  
  $("#"+tableName+" tr").remove(); 
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
    let text = document.createTextNode("")
    let row = table.insertRow();
    if(title == "Pokemon")
    {
       text = document.createTextNode(element.count+" - "+element.name+" ("+element.set+" "+element.number+")")
    }
    else
    {
      text = document.createTextNode(element.count+" - "+element.name)
    }
    let cell = row.insertCell();
    cell.appendChild(text);
  }
}