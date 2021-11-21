window.onload = function() {
  gapi.load('auth2', function() {
    gapi.auth2.init();
  });
};

function onSignIn(googleUser){
    var profile = googleUser.getBasicProfile()

    console.log("test")
    var user_student = {
        id_gg: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail()
      }
      console.log(user_student)
      $.ajax({
          url: '/login',
          method: 'post',
          data: user_student,
          success: function(user){
            window.location.replace("/");
          },
          error: function(user){
            alert(user.error)
          }
      })   
}

function signOut(){
    gapi.auth2.getAuthInstance().signOut().then(function(){
        console.log("Sign Out")
        window.location.replace("/logout");           
    })
}
