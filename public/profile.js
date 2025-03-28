$(document).ready(function () {
    // Load the background image if you want, or skip
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
  
    $('#burger-icon').click(function () {
        $('#sidebar').toggleClass('open');
      });
  });
  