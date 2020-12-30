var token, userId;

// so we don't have to write this out everytime 
const twitch = window.Twitch.ext;

// onContext callback called when context of an extension is fired 
twitch.onContext((context) => {
  console.log(context);
});

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
});

// setup a listen on the global pubsub topic
twitch.listen('broadcaster', function (topic, contentType, message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        // this accounts for JSON parse errors
        // just in case
        return;
    }

    // check that it's the exepected event
    if (message.event == 'configure') {
        configureExtension(message.data);
    }
});

// central function to accept the config from whichever source
function configureExtension(the_config) {
    // do whatever you want with your config
    // (re)build the extension
    $('$tournament_iframe').empty();
    $('$tournament_iframe').append($('<iframeframeborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px;background-color: white;" height="100%" width="100%" ></iframe>').src(options[0]));
    
}