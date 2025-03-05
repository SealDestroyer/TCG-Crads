// $(document).ready(function() {
//     // Preload background image
//     let bgImage = new Image();
//     bgImage.src = "/img/study.jpg";
//     bgImage.onload = function() {
//       $("body").css({
//         "background-image": "url('/img/study.jpg')",
//         "background-size": "cover",
//         "background-repeat": "no-repeat",
//         "background-position": "center center",
//         "background-attachment": "fixed"
//       });
//     };
//     // Handler for the Start button
//     $("#start-btn").click(function () {
//       $.ajax({
//         type: "POST",
//         url: "/startgame",
//         dataType: "json",
//         success: function (response) {
//           if (response.success) {
//             // Redirect to the game page on success
//             window.location.href = response.redirect;
//           } else {
//             // Display an error message (you might enhance this with your UI)
//             alert(response.message);
//           }
//         },
//         error: function () {
//           alert("An error occurred. Please try again.");
//         },
//       });
//     });
//   });
  
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

  // Handler for the Start button (existing code)
  $("#start-btn").click(function () {
    $.ajax({
      type: "POST",
      url: "/startgame",
      dataType: "json",
      success: function (response) {
        if (response.success) {
          window.location.href = response.redirect;
        } else {
          alert(response.message);
        }
      },
      error: function () {
        alert("An error occurred. Please try again.");
      }
    });
  });

  // Handler for the Join button (new functionality)
  $("#join-btn").click(function() {
    // For simplicity, use a prompt to get the pin code.
    // You could also render a modal or a dedicated join form.
    const pin_code = prompt("Enter the game pin code:");
    if (pin_code) {
      $.ajax({
        type: "POST",
        url: "/joingame",
        dataType: "json",
        data: { pin_code: pin_code },
        success: function(response) {
          if (response.success) {
            // Redirect to the game page on successful join
            window.location.href = response.redirect;
          } else {
            // Display an error message from the server
            alert(response.message);
          }
        },
        error: function() {
          alert("An error occurred. Please try again.");
        }
      });
    }
  });
});
