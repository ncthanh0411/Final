window.onload = function () {
  gapi.load("auth2", function () {
    gapi.auth2.init();
  });
};

// const socket = io('/');

function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log("test");
  var user_student = {
    id_gg: profile.getId(),
    name: profile.getName(),
    email: profile.getEmail(),
  };
  console.log(user_student);
  $.ajax({
    url: "/login",
    method: "post",
    data: user_student,
    success: function (user) {
      window.location.replace("/");
    },
    error: function (user) {
      alert(user.error);
    },
  });
}
function signOut() {
  console.log("logging out");
  gapi.auth2
    .getAuthInstance()
    .signOut()
    .then(function () {
      console.log("Sign Out");
      window.location.replace("/logout");
    });
}

// ------------------------- Create department, Create User -------------
function newDepartment() {
  var newDep = $("#newDepartment").val();
  $.ajax({
      url: '/admin/newDepartment',
      method: 'post',
      data: {department: newDep},
      success: function(data) {
          if(data.isvalid) {
              $('#newDepartment').val('');
              document.getElementById('depart_table').innerHTML += '<tr id="tr_depart' + data.newdepart._id + '">' + 
                '<td>' + data.newdepart.departmentName + '</td>' +
                '<td>' +
                  '<button type="button" class="btn btn-light fa fa-edit" onclick="editDepartDialog(`' + data.newdepart._id + '`)" data-toggle="modal" data-target="#edit-department-dialog"/>' +
                  '<button type="button" class="btn btn-light fa fa-minus-circle" onclick="confirmDelDepart(`' + data.newdepart._id + '`)" data-toggle="modal" data-target="#conf-del-depart"/>' +
                '</td>' +
              '</tr>';
          } else {
              alert(data.msg);
          }
      },
      error: function(xhr, sts, errr) {
          console.log(err);
      }
  });
}

function setCreate() {
  $(".js-example-basic-multiple").select2();
}

function createUser() {
  var departlst = $(".js-example-basic-multiple").select2("val");
  $.ajax({
    url: "/admin/createUser",
    method: "post",
    data: {
      name: $("#newName").val(),
      username: $("#newUsername").val(),
      password: $("#newPassword").val(),
      confpassword: $("#newConfpassword").val(),
      department: JSON.stringify(departlst),
    },
    success: function (data) {
      if (data.isvalid) {
        $("#newName").val("");
        $("#newUsername").val("");
        $("#newPassword").val("");
        $("#newConfpassword").val("");
        $(".js-example-basic-multiple").val("").trigger("change");

        let email = '';
        if(data.newuser.email) email = data.newuser.email;
        let tb_html = 
          '<tr id="tr_user' + data.newuser._id + '">' +
            '<td>' +
                '<img src="/w3images/avatar2.png" class="w3-left w3-circle w3-margin-right" style="width:35px">' +
                '<span class="w3-xlarge">' + data.newuser.name + '</span><br>'+
            '</td>' +
            '<td>' + data.newuser.username + '</td>' +
            '<td>' + email + '</td>' +
            '<td id="td_depart_' + data.newuser._id + '">';
        
        if(data.newuser.department) {
          data.newuser.department.forEach(depart => {
            tb_html += '<p id="DU_' + depart._id + '">' + depart.departmentName + '</p>';
          })
        }

        tb_html +=        
            '</td>' +
            '<td>' +
                '<button type="button" class="btn btn-light fa fa-edit" onclick="editDUserDialog(`' + data.newuser._id + '`, `' + data.newuser.username + '`)" data-toggle="modal" data-target="#edit-userdepart-dialog"/>' +
                '<button type="button" class="btn btn-light fa fa-minus-circle" onclick="confirmDelUser(`' + data.newuser._id + '`, `' + data.newuser.username + '`)" data-toggle="modal" data-target="#conf-del-user"/>' +
            '</td>' +
        '</tr>';
        document.getElementById('departuser_table').innerHTML += tb_html;
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function confirmDelDepart(id) {
  $('#delDepartName').text(document.getElementById('tr_depart' + id).cells[0].innerText);
  $('#delidD').val(id);
}

function confirmDelUser(id, name) {
  $('#delUserName').text(name);
  $('#delidU').val(id);
}

function editDepartDialog(id) {
  $('#editDepartment').val(document.getElementById('tr_depart' + id).cells[0].innerText);
  $('#editD').val(id);
}

function editDepart() {
  let id = $('#editD').val();
  let edit_name = $('#editDepartment').val();
  
  $.ajax({
    url: '/admin/upDepart/' + id,
    method: 'put',
    data: { name: edit_name },
    success: function (data) {
      if (data.isvalid) {
        $('#editDepartment').val('');
        $('#editD').val();
        document.getElementById('tr_depart' + id).cells[0].innerText = data.editeddepart.departmentName;
        alert(data.msg);
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function editDUserDialog(id, username) {
  $(".js-editDU-basic-multiple").select2();
  $('#editUD_hidden').val(id);
  $('#editUserDepart').text(username);
  $('#editUDName').val(document.getElementById('tr_user' + id).cells[0].children[1].innerText);
  var lst_p = document.getElementById('td_depart_' + id).getElementsByTagName('p');
  var departLst = [];
  for (var i = 0; i < lst_p.length; i++) {
    departLst.push(lst_p[i].id.replace('DU_', ''));
  }
  $(".js-editDU-basic-multiple").val(departLst).trigger('change');
}

function editDUser() {
  var id = $('#editUD_hidden').val();
  var departlst = $(".js-editDU-basic-multiple").select2("val");
  $.ajax({
    url: "/admin/editDUser/" + id,
    method: "put",
    data: {
      name: $('#editUDName').val(),
      password: $("#newDUPassword").val(),
      confpassword: $("#newDUPasswordConf").val(),
      department: JSON.stringify(departlst),
    },
    success: function (data) {
      if (data.isvalid) {
        document.getElementById('tr_user' + id).cells[0].children[1].innerText = data.useredit.name;
        var departHtml = '';
        data.useredit.department.forEach(depart => {
          departHtml += '<p id="DU_' + depart._id + '">'+ depart.departmentName + '</p>';
        });
        document.getElementById('td_depart_' + id).innerHTML = departHtml;
        alert(data.msg);
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function editSUserDialog(id, email) {
  $(".js-editSU-basic-single").select2();
  $('#editSU_hidden').val(id);
  $('#editUserStu').text(email);
  $('#editSUName').val(document.getElementById('tr_user' + id).cells[0].children[1].innerText);
  $('#editSUClass').val(document.getElementById('tr_user' + id).cells[2].innerText);
  var departid = document.getElementById('td_stu_' + id).getElementsByTagName('span');
  if(departid.length != 0) {
    $(".js-editSU-basic-single").val(departid[0].id.replace('SU_', '')).trigger('change');
  }
}

function editSUser() {
  var id = $('#editSU_hidden').val();
  var depart = $(".js-editSU-basic-single").select2("val");
  $.ajax({
    url: "/admin/editSUser/" + id,
    method: "put",
    data: {
      name: $('#editSUName').val(),
      stuclass: $('#editSUClass').val(),
      department: depart,
    },
    success: function (data) {
      if (data.isvalid) {
        document.getElementById('tr_user' + id).cells[0].children[1].innerText = data.useredit.name;
        document.getElementById('tr_user' + id).cells[2].innerText = data.useredit.class;
        document.getElementById('td_stu_' + id).innerHTML = '<span id="SU_' + data.useredit.department[0]._id + '">'+ data.useredit.department[0].departmentName + '</span>';
        alert(data.msg);
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function delDepart() {
  let id = $("#delidD").val();
  $.ajax({
    url: "/admin/delDepart",
    method: "delete",
    data: { id: id },
    success: function (data) {
      if (data.isvalid) {
        $("#tr_depart" + id).remove();
        $("#delDepartName").text("");
        $("#delidD").val("517H0042");
        alert(data.msg);
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function delUser() {
  let id = $('#delidU').val();
  $.ajax({
    url: '/admin/delUser',
    method: 'delete',
    data: { id: id },
    success: function (data) {
      if (data.isvalid) {
        $('#tr_user' + id).remove();
        $('#delUserName').text('');
        $('#delidU').val('517H0042');
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}

function previewEditAvatar(input) {
  var imgfile = $("#edit_upload_img").get(0).files[0];
  if(imgfile){
    var reader = new FileReader();

    reader.onload = function(){
        $("#edit_user_avatar").attr("src", reader.result);
    }
    reader.readAsDataURL(imgfile);
  }
}

function closeEditError() {
  document.getElementById('edit_user_div_error').className = 
    document.getElementById('edit_user_div_error').className.replace( /(?:^|\s)show(?!\S)/g , '' );
  $('#edit_user_error').text('OMG ERROR');
}

function editUser(event) {
  event.preventDefault();
  var id = $('#edit_hidden_id').val();
  var formData = new FormData(document.getElementById("formEditUser"));
  $.ajax({
      type: "PUT",
      url: "/edit/" + id,
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        if (data.isvalid) {
          console.log(data.msg);
          window.location.reload();
          // ??????
        } else {
          $('#edit_user_error').text(data.msg);
          document.getElementById('edit_user_div_error').classList.add('show');
        }
      },
      error: function (err) {
        console.log(err);
        alert(err);
      }
  });  
}

function avatarRemove() {
  var id = $('#edit_hidden_id').val();
  $.ajax({
    type: "POST",
    url: "/avatarRm/" + id,
    success: function(data){
      if (data.isvalid) {
        // ??????
      } else {
        $('#edit_user_error').text(data.msg);
        document.getElementById('edit_user_div_error').classList.add('show');
      }
    },
    error: function (err) {
      console.log(err);
      alert(err);
    }
  }); 
}

function notiSubmit() {
  var id = $('#userHidden').val();
  var depart = $('#user_selected_depart').find(':selected').val();
  var title = $('#user_noti_title').val().replace(/\n/g, '<br/>');
  var content = $('#user_noti_content').val().replace(/\n/g, '<br/>');
  $.ajax({
    type: "POST",
    url: "/users/notiPost",
    data: {
      id: id,
      depart: depart,
      title: title,
      content: content
    },
    success: function(data){
      if (data.isvalid) {
        socket.emit('showFlash', data.departName);
        $('#user_noti_title').val('');
        $('#user_noti_content').val('');
        alert('Đăng thông báo thành công!');
      } else {
        alert(data.msg);
      }
    },
    error: function (err) {
      console.log(err);
      alert(err);
    }
  }); 
}

socket.on('showFlash', departName => {
  document.getElementById('myFlashMsg').style.display = 'inline-block';
  document.getElementById('myFlashMsg').classList.add('show');
  $('#flashDepart').text(departName);
});

// ------------------------- Layout -------------------------------------

//----------------------------- Post, Like, Comment ------------------------------------

function addPost(post){
  var post_id = "'" + post._id + "'"
  var youtube_link = ''
  var img = ''
  if(post.image){
    img = '<img src="' + post.image +  '" alt=""> '
  }
  if(post.youtube_url)
  {
  youtube_link = '  <iframe width="420" height="315" ' +
                 '  src= ' + post.youtube_url          +
                 ' allow="autoplay;" allowfullscreen> ' +
                 ' </iframe>                         '
  }
  console.log(post_id)
  var post_link = 
  '<div class="central-meta item">' +
    '<div class="user-post">'         +
    '  <div class="friend-info">    ' +
    '    <figure>                   ' +
    '      <img src="images/resources/friend-avatar10.jpg" alt="">        ' + 
    '    </figure>                  ' +
    '    <div class="friend-name">  ' +
    '      <ins><a href="time-line.html" title="">' + post.user.name + '</a></ins> ' +
    '      <span>published: ' + post.create_date + '</span> ' +
    '    </div>                     ' +
    '    <div class="description">  ' +
    '      <p>                      ' +
              post.content +
    '      </p>                     ' +
    '    </div>                     ' +
    '    <div class="post-meta">    ' +
          img + youtube_link +            
    '      <div class="we-video-info">  ' +
    '        <ul>                       ' +
    '          <li>                     ' +
    '            <span class="like" data-toggle="tooltip" ' +
    '              title="like">        ' +
    '              <i class="ti-heart"></i>               ' +
    '              <ins>0</ins>         ' +
    '            </span>                ' +
    '          </li>                    ' +
    '          <li>                     ' +
    '            <span class="comment" data-toggle="tooltip" ' +
    '              title="Comments">    ' +
    '              <i class="fa fa-comments-o"></i>          ' +
    '              <ins>0</ins>         ' +
    '            </span>                ' +
    '          </li>                    ' +
    '        </ul>                      ' +
    '      </div>                       ' +
    '    </div>                         ' +
    '  </div>                           ' +
    '  <div class="coment-area">        ' +
    '    <ul class="we-comet">          ' +
    '      <li class="post-comment">    ' +
    '        <div class="comet-avatar"> ' +
    '          <img src="images/resources/comet-1.jpg" alt=""> ' +
    '        </div>                     ' +
    '        <div class="post-comt-box"> ' +
    '          <form method="post">      ' +
    '            <textarea placeholder="Post your comment" ' +
    '              id="comment_content' + post._id +'"' +
    '              onkeypress="post_comment(event,' + post_id +')"></textarea> ' +
    '            <div class="add-smiles">             ' +
    '              <span class="em em-expressionless" ' +
    '                title="add icon"></span>         ' +
    '            </div>                               ' +
    '            <button type="submit"></button>      ' +
    '          </form>                                ' +
    '        </div>                                   ' +
    '          </li>                                  ' +
    '    </ul>                                        ' +
    '    <ul class="we-comet"  id = "post_comment' + post._id  + '"> ' +
    '    </ul>                                            ' +
    '    <ul class="we-comet">                            ' +
    '      <li>                                           ' +
    '        <a href="#" title="" class="showmore underline">more ' +
    '          comments</a> ' +
    '      </li> ' +
    '    </ul> ' +
    '  </div> ' +
    '</div> ' +
  '</div> '

  return post_link;
}

//New Post
function postForm(e) {
  e.preventDefault();
  var formData = new FormData(document.getElementById("formSubmit"));
  $.ajax({
      type: "POST",
      url: "/post/",
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        //Clear
        $("#content").val("")
        $("#video_youtube").val("")
        $("#previewImg").attr("src", "");
        $("input[type=file]").val("")
        $("#youtube_link").css("display", "none")
        console.log(data)
        $('#list_post').prepend(addPost(data))
      },
      error: function (err) {
        console.log(err);
        alert(err);
      }
  });  
}

//edit Post
function putForm(e) {
  console.log("test")
  e.preventDefault();
  var formData = new FormData(document.getElementById("formSubmitEdit"));
  $.ajax({
      type: "PUT",
      url: "/post/",
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
        var id = data._id
        console.log(data)
        $('#contentPost' + id).text(data.content)
        let img = $("#previewImgEdit").attr("src");

        $("#imgPost" + id).attr('src', img);
        $("#if_frame" + id).attr('src', data.youtube_url);  
        $("#videoPost" + id).text(data.youtube_url);
        document.getElementById("close_post").click()
      },
      error: function (err) {
        console.log(err);
        alert(err);
      }
  });  
}

function previewFile(input){
  $("#youtube_link").css("display", "none")
  var file = $("input[type=file]").get(0).files[0];
  if(file){
    var reader = new FileReader();

    reader.onload = function(){
        $("#previewImg").attr("src", reader.result);
    }

    reader.readAsDataURL(file);
    $("#video_youtube").val("")
  }
}
//Show Post need to edit
function showPost(id) {
  //Refresh data
  $("#previewImgEdit").attr("src", "");
  $("#previewImgEdit").css("display", "none")
  $("#youtube_link_edit").css("display", "none")

  //Content
  let content = $("#contentPost" + id).text()
  console.log(content)
  $("#edit_post").val(content)

  //Send ID
  $("#postEdit").val(id)

  if($("#imgPost" + id).length != 0)
  {
    //Image
    $("#previewImgEdit").css("display", "block")
    let img = $("#imgPost" + id).attr('src');
    $("#previewImgEdit").attr("src", img);


    //icon
    $("#image_edit_icon").show()
    $("#video_edit_icon").hide()
  }

  if($("#videoPost" + id).length != 0){
    //Video
    let video_link = $("#videoPost" + id).text()
    $("#youtube_link_edit").css("display", "block")
    $("#video_youtube_edit").val(video_link)

    //icon
    $("#image_edit_icon").hide()
    $("#video_edit_icon").show()   
  }

}


function previewFileEdit(input){
  console.log($("#file_edit"))
  var file = $("#file_edit").get(0).files[0];
  if(file){
    var reader = new FileReader();
    reader.onload = function(){
        $("#previewImgEdit").attr("src", reader.result);
    }
    reader.readAsDataURL(file);
  }
}

function showVideo() {
  if ($("#youtube_link").css("display") == "none") {
    $("#youtube_link").css("display", "block");
    $("#previewImg").attr("src", "");
    $("input[type=file]").val("");
  } else {
    $("#youtube_link").css("display", "none");
  }
}
//New Comment
function post_comment(e, id) {
  //Press enter event
  if (e.keyCode == 13) {
    //Post
    let post_comment = $("#post_comment" + id);
    //Get content of comment
    let comment_content = $("#comment_content" + id);
    console.log(comment_content.val())
    var comment = {
      id_post: id,
      comment: comment_content.val(),
    };
  
    $.ajax({
      url: "/post/comment",
      method: "post",
      data: comment,
      success: function (comment) {
        console.log(comment)
        var comment_id = "'" + comment.id + "'"
        var comment_HTML =
          "<li id = 'commentLi" + comment.id  + "'>" +
          '<div class="comet-avatar">' +
            '<img src="images/resources/comet-1.jpg" alt="">' +
          '</div>' +
          '<div class="we-comment">' +
            '<div class="coment-head">' +
              '<h5><a href="time-line.html" title="">' +
              comment.user_name +
              '</a></h5>' +
              '<span>' +
              comment.create_date +
              "</span>" +
            "</div>" +
            '<p id = "content_comment' + comment.id + '">' +
            comment.content +
            "</p>" +
            '<i class="fa fa-edit" style="cursor: pointer;" data-toggle="modal"'  +
            'data-target="#editComment" onclick="showComment(' + comment_id +')"></i>' +
            '<i class="fa fa-remove" style="cursor: pointer;" data-toggle="modal"' +
            'data-target="#deleteComment" onclick="showDelComment(' + comment_id +')"></i>' +
          "</div>" +
          "</li>";         
        post_comment.prepend(comment_HTML);
        comment_content.val("");
      },
      error: function (comment) {
        console.log(comment);
        alert("Fail to comment");
      },
    });
  }
}

//Show Comment need to edit
function showComment(id) {
  
  $('#commentEdit').val(id)
  let content = $("#content_comment" + id).text();
  $("#edit_comment").val(content);

}
function showDelComment(id) {

  $('#commentDelete').val(id);
}

//Edit Comment
function editComment() {

    let id = $("#commentEdit").val(); 
    //Get content of comment
    let content = $("#edit_comment");
    var comment = {
      id: id,
      comment: content.val(),
    };
    $.ajax({
      url: "/post/comment/" + id,
      method: "post",
      data: comment,
      success: function (comment) {
        let content_update = $("#content_comment" + id);
        content_update.text(content.val());
      },
      error: function (err) {
        console.log(err.responseJSON);
        alert(err.responseJSON.message);
      },
    });
 
}

//Delete Comment
function deleteComment() {

  let id = $("#commentDelete").val(); 
  var commentDelete = $('#commentLi' + id);
  var comment = {
    id: id,
  };
  $.ajax({
      url: "/post/comment/" + id,
      method: "DELETE",
      success: function(data){
        //Clear
        commentDelete.remove();
      },
      error: function (err) {
        console.log(err.responseJSON.message);
        alert(err.responseJSON.message);
      }
  });  
}

