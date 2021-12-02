window.onload = function () {
  gapi.load("auth2", function () {
    gapi.auth2.init();
  });
};
$(document).ready(function () {
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
          } else {
              alert(data.msg);
          }
      },
      error: function(xhr, sts, errr) {
          console.log(err);
      }
  })
}

// ------------------------- Layout -------------------------------------

function createUser() {
  var departlst = $(".js-example-basic-multiple").select2("val");
  $.ajax({
    url: '/admin/createUser',
    method: 'post',
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
      } else {
        alert(data.msg);
      }
    },
    error: function (xhr, sts, errr) {
      console.log(err);
    },
  });
}


//----------------------------- Post, Like, Comment ------------------------------------
function post_comment(e,id){
    //Press enter event
    if (e.keyCode == 13) {
      //Post
      let post_comment =  $('#post_comment'+id)
      //Get content of comment
      let comment_content = $('#comment_content'+id);   
      var comment = {
        id_post: id,
        comment: comment_content.val()
      }
      $.ajax({
          url: '/post/comment/' + id,
          method: 'post',
          data: comment,
          success: function(comment){
            var comment_HTML =
            '	<li>' +
              '<div class="comet-avatar">' +
              '<img src="images/resources/comet-1.jpg" alt=""></div>' +
              '<div class="we-comment">' +
              '<div class="coment-head">' +
              '<h5><a href="time-line.html" title="">' + comment.user_name + '</a></h5>' +
              '<span>' + comment.create_date +'</span><a class="we-reply" href="#" title="Reply"><i class="fa fa-reply"></i></a></div>' +
              '<p>' + comment.content +'</p></div>' +
            '</li>';           
            post_comment.prepend(comment_HTML)
            comment_content.val("") 
          },
          error: function(comment){
            console.log(comment)
            alert('Fail to comment')
          }
      })       
  }

  
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
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
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
