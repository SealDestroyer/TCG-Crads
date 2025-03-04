$(document).ready(function() {
    // Preload background image
    let bgImage = new Image();
    bgImage.src = "/img/study.jpg";
    bgImage.onload = function() {
      $("body").css({
        "background-image": "url('/img/study.jpg')",
        "background-size": "cover",
        "background-repeat": "no-repeat",
        "background-position": "center center",
        "background-attachment": "fixed"
      });
    };
    // Handler for the Start button
    $("#start-btn").click(function () {
      $.ajax({
        type: "POST",
        url: "/startgame",
        dataType: "json",
        success: function (response) {
          if (response.success) {
            // Redirect to the game page on success
            window.location.href = response.redirect;
          } else {
            // Display an error message (you might enhance this with your UI)
            alert(response.message);
          }
        },
        error: function () {
          alert("An error occurred. Please try again.");
        },
      });
    });
  });
  
