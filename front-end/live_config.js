var token, userId;

// so we don't have to write this out everytime 
const twitch = window.Twitch.ext;

// onContext callback called when context of an extension is fired 
twitch.onContext((context) => {
  console.log(context);
});


// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
  // save our credentials
  token = auth.token;  
  userId = auth.userId; 
});

$(function(){
    $("#form").submit(function(e){
        e.preventDefault()
        options = []
        tournament_url = $("#tournament_url").val() 
        options.push(tournament_url)
        player_url = $("#player_url").val()      
        options.push(player_url)
        twitch.send("broadcast","application/json",JSON.stringify(options))

        twitch.listen("broadcast", function(target, contentType, message){
            console.log("ddd")
            updateView(target, contentType, message)
        })
    })
})

