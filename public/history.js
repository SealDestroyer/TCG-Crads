$(document).ready(function () {
    // ✅ Background preload
    let bg = new Image();
    bg.src = "/img/test.jpg";
    bg.onload = function () {
      $("body").css({
        "background-image": "url('/img/test.jpg')",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "background-position": "center center",
        "background-attachment": "fixed"
      });
    };
  
    // ✅ Sidebar toggle (mobile)
    $('#burger-icon').click(function () {
      $('#sidebar').toggleClass('open');
    });
  });
  