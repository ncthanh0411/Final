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

function newDepartment() {
  var newDep = $('#newDepartment').val();
  $.ajax({
      url: '/newDepartment',
      method: 'post',
      data: {department: newDep},
      success: function(data) {
          if(data.isvalid) {
              $('#newDepartment').val('');
          } else {
              alert(data.msg);
          }
      },
      error: function(xhr, sts, errr) {
          console.log(err);
      }
  });
}

function createUser() {
  $.ajax({
    url: '/createUser',
    method: 'post',
    data: {
      name: $('#newName').val(),
      username: $('#newUsername').val(),
      password: $('#newPassword').val(),
      confpassword: $('#newConfpassword').val(),
    },
    success: function(data) {
        if(data.isvalid) {
          $('#newName').val('');
          $('#newUsername').val('');
          $('#newPassword').val('');
          $('#newConfpassword').val('');
        } else {
            alert(data.msg);
        }
    },
    error: function(xhr, sts, errr) {
        console.log(err);
    }
  });
}

