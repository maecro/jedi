function login() {

  FB.login(function(response) {
    if (response.authResponse) {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Good to see you, ' + response.name + '.');
        window.location.replace("http://localhost:3000");
      });
    } else {
      console.log('User cancelled login or did not fully authorize.');
    }
  });
}

function logout() {

  FB.logout(function(response) {
    // user is now logged out
    window.location.replace("http://localhost:3000");
  });
}

function getNodes() {
  var nodes = [];

  // Push root node i.e. me
  nodes.push(new PhiloGL.O3D.Sphere({ nlat: 20, nlong: 20, radius: 1, colors: [1, 0, 0, 1] }));

  FB.api('/me/friends', function(response) {
//console.log(response);
    $.each(response.data, function(key, val) {
   // console.log(key + ":" + val.name);
      nodes.push(new PhiloGL.O3D.Sphere({ nlat: 20, nlong: 20, radius: 1, colors: [1, 0, 0, 1] }));
    });

  });

  return nodes;
}

$(function() {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '293391064067105', // App ID
      channelUrl : '//localhost:3000/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    // Additional initialization code here
  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));

});
