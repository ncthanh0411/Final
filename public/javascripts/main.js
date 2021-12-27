window.onload = function () {
  gapi.load("auth2", function () {
    gapi.auth2.init();
  });
};
$(document).ready(function () {
  if ($(".js-example-basic-multiple").length != 0)
    $(".js-example-basic-multiple").select2();
});
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
  if ( $("#youtube_link").css('display') == 'none'){
    $("#youtube_link").css("display", "block")
    $("#previewImg").attr("src", "");
    $("input[type=file]").val("")
  }
  else {
    $("#youtube_link").css("display", "none")
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
    var comment = {
      id_post: id,
      comment: comment_content.val(),
    };
    $.ajax({
      url: "/post/comment",
      method: "post",
      data: comment,
      success: function (comment) {
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


//----------------------------- Layout ------------------------------------
if ($("#map-canvas").length) {
  jQuery(document).ready(function ($) {
    var map;
    function initialize() {
      var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(37.048437, -100.921268),
      };
      map = new google.maps.Map(
        document.getElementById("map-canvas"),
        mapOptions
      );
      var marker = new google.maps.Marker({
        map: map,
        icon: "images/map-marker.png",
        title: "Mi marcador",
        position: map.getCenter(),
      });
      var marker2 = new google.maps.Marker({
        map: map,
        icon: "images/map-marker2.png",
        title: "Otro marker",
        position: new google.maps.LatLng(37.07145, -100.900326),
      });
      var marker3 = new google.maps.Marker({
        map: map,
        icon: "images/map-marker3.png",
        title: "Otro marker mas",
        position: new google.maps.LatLng(37.020208, -100.917492),
      });
      var infowindow = new google.maps.InfoWindow();
      infowindow.setContent("<b>Mi marcador</b><br>Tel: 46546545");
      var infowindow2 = new google.maps.InfoWindow();
      infowindow2.setContent("<b>Otro marker</b><br>Tel: 46546545");
      var infowindow3 = new google.maps.InfoWindow();
      infowindow3.setContent("<b>Otro marker mas</b><br>Tel: 46546545");
      infowindow.open(map, marker);
      google.maps.event.addListener(marker, "click", function () {
        infowindow.open(map, marker);
      });
      google.maps.event.addListener(marker2, "click", function () {
        infowindow2.open(map, marker2);
      });
      google.maps.event.addListener(marker3, "click", function () {
        infowindow3.open(map, marker3);
      });
    }
    google.maps.event.addDomListener(window, "load", initialize);
  });
}
jQuery(document).ready(function ($) {
  $(".top-area > .setting-area > li").on("click", function () {
    $(this).siblings().children("div").removeClass("active");
    $(this).children("div").addClass("active");
    return false;
  });
  $("body *")
    .not(".top-area > .setting-area > li")
    .on("click", function () {
      $(".top-area > .setting-area > li > div").removeClass("active");
    });
  $(".user-img").on("click", function () {
    $(".user-setting").toggleClass("active");
    return false;
  });
  $(".friendz-list > li, .chat-users > li").on("click", function () {
    $(".chat-box").addClass("show");
    return false;
  });
  $(".close-mesage").on("click", function () {
    $(".chat-box").removeClass("show");
    return false;
  });
  if ($.isFunction($.fn.perfectScrollbar)) {
    $(
      ".dropdowns, .twiter-feed, .invition, .followers, .chatting-area, .peoples, #people-list, .chat-list > ul, .message-list, .chat-users, .left-menu"
    ).perfectScrollbar();
  }
  $(".trigger").on("click", function () {
    $(this).parent(".menu").toggleClass("active");
  });
  $(".add-smiles > span").on("click", function () {
    $(this).parent().siblings(".smiles-bunch").toggleClass("active");
  });
  $(".notification-box > ul li > i.del").on("click", function () {
    $(this).parent().slideUp();
    return false;
  });
  $(".f-page > figure i").on("click", function () {
    $(".drop").toggleClass("active");
  });
  (function ($) {
    jQuery.expr[":"].Contains = function (a, i, m) {
      return (
        (a.textContent || a.innerText || "")
          .toUpperCase()
          .indexOf(m[3].toUpperCase()) >= 0
      );
    };
    function listFilter(searchDir, list) {
      var form = $("<form>").attr({ class: "filterform", action: "#" }),
        input = $("<input>").attr({
          class: "filterinput",
          type: "text",
          placeholder: "Search Contacts...",
        });
      $(form).append(input).appendTo(searchDir);
      $(input)
        .change(function () {
          var filter = $(this).val();
          if (filter) {
            $(list)
              .find("li:not(:Contains(" + filter + "))")
              .slideUp();
            $(list)
              .find("li:Contains(" + filter + ")")
              .slideDown();
          } else {
            $(list).find("li").slideDown();
          }
          return false;
        })
        .keyup(function () {
          $(this).change();
        });
    }
    $(function () {
      listFilter($("#searchDir"), $("#people-list"));
    });
  })(jQuery);
  $("body").show();
  NProgress.start();
  setTimeout(function () {
    NProgress.done();
    $(".fade").removeClass("out");
  }, 2000);
  // $(function () {
  //   console.log($('[data-toggle="tooltip"]'));
  //   $('[data-toggle="tooltip"]').tooltip();
  // });
  if ($(window).width() < 769) {
    jQuery(".sidebar").children().removeClass("stick-widget");
  }
  if ($.isFunction($.fn.stick_in_parent)) {
    $(".stick-widget").stick_in_parent({
      parent: "#page-contents",
      offset_top: 60,
    });
    $(".stick").stick_in_parent({ parent: "body", offset_top: 0 });
  }
  $(".we-page-setting").on("click", function () {
    $(".wesetting-dropdown").toggleClass("active");
  });
  $("#nightmode").on("change", function () {
    if ($(this).is(":checked")) {
      $(".theme-layout").addClass("black");
    } else {
      $(".theme-layout").removeClass("black");
    }
  });
  if ($.isFunction($.fn.chosen)) {
    $("select").chosen();
  }
  if ($.isFunction($.fn.userincr)) {
    $(".manual-adjust")
      .userincr({ buttonlabels: { dec: "-", inc: "+" } })
      .data({ min: 0, max: 20, step: 1 });
  }
  if ($.isFunction($.fn.loadMoreResults)) {
    $(".loadMore").loadMoreResults({
      displayedItems: 3,
      showItems: 1,
      button: { class: "btn-load-more", text: "Load More" },
    });
  }
  if ($.isFunction($.fn.owlCarousel)) {
    $(".sponsor-logo").owlCarousel({
      items: 6,
      loop: true,
      margin: 30,
      autoplay: true,
      autoplayTimeout: 1500,
      smartSpeed: 1000,
      autoplayHoverPause: true,
      nav: false,
      dots: false,
      responsiveClass: true,
      responsive: { 0: { items: 3 }, 600: { items: 3 }, 1000: { items: 6 } },
    });
  }
  if ($.isFunction($.fn.slick)) {
    $(".slider-for-gold").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      slide: "li",
      fade: false,
      asNavFor: ".slider-nav-gold",
    });
    $(".slider-nav-gold").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: ".slider-for-gold",
      dots: false,
      arrows: true,
      slide: "li",
      vertical: true,
      centerMode: true,
      centerPadding: "0",
      focusOnSelect: true,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            vertical: false,
            centerMode: true,
            dots: false,
            arrows: false,
          },
        },
        {
          breakpoint: 641,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            vertical: true,
            centerMode: true,
            dots: false,
            arrows: false,
          },
        },
        {
          breakpoint: 420,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: true,
            vertical: false,
            centerMode: true,
            dots: false,
            arrows: false,
          },
        },
      ],
    });
  }
  $(function () {
    $("#menu").mmenu();
    $("#shoppingbag").mmenu({
      navbar: { title: "General Setting" },
      offCanvas: { position: "right" },
    });
    $(".mh-head.first").mhead({ scroll: { hide: 200 } });
    $(".mh-head.second").mhead({ scroll: false });
  });
  $("span.main-menu").on("click", function () {
    $(".side-panel").addClass("active");
    $(".theme-layout").addClass("active");
    return false;
  });
  $(".theme-layout").on("click", function () {
    $(this).removeClass("active");
    $(".side-panel").removeClass("active");
  });
  $("button.signup").on("click", function () {
    $(".login-reg-bg").addClass("show");
    return false;
  });
  $(".already-have").on("click", function () {
    $(".login-reg-bg").removeClass("show");
    return false;
  });
  if ($.isFunction($.fn.downCount)) {
    $(".countdown").downCount({ date: "11/12/2018 12:00:00", offset: +10 });
  }
  // jQuery(".post-comt-box textarea").on("keydown", function (event) {
  //   if (event.keyCode == 13) {
  //     var comment = jQuery(this).val();
  //     var parent = jQuery(".showmore").parent("li");
  //     var comment_HTML =
  //       '	<li><div class="comet-avatar"><img src="images/resources/comet-1.jpg" alt=""></div><div class="we-comment"><div class="coment-head"><h5><a href="time-line.html" title="">Jason borne</a></h5><span>1 year ago</span><a class="we-reply" href="#" title="Reply"><i class="fa fa-reply"></i></a></div><p>' +
  //       comment +
  //       "</p></div></li>";
  //     $(comment_HTML).insertBefore(parent);
  //     jQuery(this).val("");
  //   }
  // });
  $(".message-list > li > span.star-this").on("click", function () {
    $(this).toggleClass("starred");
  });
  $(".message-list > li > span.make-important").on("click", function () {
    $(this).toggleClass("important-done");
  });
  $("#select_all").on("click", function (event) {
    if (this.checked) {
      $("input:checkbox.select-message").each(function () {
        this.checked = true;
      });
    } else {
      $("input:checkbox.select-message").each(function () {
        this.checked = false;
      });
    }
  });
  $(".delete-email").on("click", function () {
    $(".message-list .select-message").each(function () {
      if (this.checked) {
        $(this).parent().slideUp();
      }
    });
  });
  $(".category-box").hover(function () {
    $(this).addClass("selected");
    $(this)
      .parent()
      .siblings()
      .children(".category-box")
      .removeClass("selected");
  });
  const menu = document.querySelector("#toggle");
  const menuItems = document.querySelector("#overlay");
  const menuContainer = document.querySelector(".menu-container");
  const menuIcon = document.querySelector(".canvas-menu i");
  function toggleMenu(e) {
    menuItems.classList.toggle("open");
    menuContainer.classList.toggle("full-menu");
    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.add("fa-times");
    e.preventDefault();
  }
  if (menu) {
    menu.addEventListener("click", toggleMenu, false);
  }
  $(".offcanvas-menu li.menu-item-has-children > a").on("click", function () {
    $(this).parent().siblings().children("ul").slideUp();
    $(this).parent().siblings().removeClass("active");
    $(this).parent().children("ul").slideToggle();
    $(this).parent().toggleClass("active");
    return false;
  });
});
