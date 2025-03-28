// $(document).ready(function() {
//   // Preload background image
//   let bgImage = new Image();
//   bgImage.src = "/img/studybeta.jpg";
//   bgImage.onload = function() {
//     $("body").css({
//       "background-image": "url('/img/studybeta.jpg')",
//       "background-size": "cover",
//       "background-repeat": "no-repeat",
//       "background-position": "center center",
//       "background-attachment": "fixed"
//     });
//   };

//   // Handler for the Start button (existing code)
//   $("#start-btn").click(function () {
//     $.ajax({
//       type: "POST",
//       url: "/startgame",
//       dataType: "json",
//       success: function (response) {
//         if (response.success) {
//           window.location.href = response.redirect;
//         } else {
//           alert(response.message);
//         }
//       },
//       error: function () {
//         alert("An error occurred. Please try again.");
//       }
//     });
//   });

//   // Show join modal when Join button is clicked
//   $("#join-btn").click(function() {
//     $("#join-pin").val("");          // Clear previous input
//     $("#joinModal").fadeIn();
//   });

//   // Hide join modal when the close (×) button is clicked
//   $(".close-button").click(function() {
//     $("#joinModal").fadeOut();
//   });

//   // Handle join submission from within the join modal
//   $("#modal-join-btn").click(function() {
//     const pin_code = $("#join-pin").val().trim();
//     if (pin_code === "") {
//       showValidationModal("Please enter a game pin code", false);
//       return;
//     }
//     $.ajax({
//       type: "POST",
//       url: "/joingame",
//       dataType: "json",
//       data: { pin_code: pin_code },
//       success: function(response) {
//         if (response.success) {
//           showValidationModal("Successful join!", true, response.redirect);
//         } else {
//           showValidationModal(response.message, false);
//         }
//       },
//       error: function() {
//         showValidationModal("An error occurred. Please try again.", false);
//       }
//     });
//   });

//   // When the OK button in the nested validation modal is clicked, immediately redirect
//   $("#validation-ok-btn").click(function() {
//     var redirectUrl = $("#validationModal").data("redirect");
//     $("#validationModal").hide();
//     $("#joinModal").hide();
//     if (redirectUrl) {
//       window.location.href = redirectUrl;
//     } else {
//       window.location.href = "/homepage";
//     }
//   });

//   // Optional: hide join modal if clicking outside of modal-content
//   $(window).click(function(event) {
//     if ($(event.target).is("#joinModal")) {
//       $("#joinModal").fadeOut();
//     }
//   });

//   // Function to show the nested validation modal
//   // message: text to display, success: true if join succeeded, redirect (optional) for success redirect
//   function showValidationModal(message, success, redirect) {
//     $("#validation-message").text(message);
//     if (success && redirect) {
//       $("#validationModal").data("redirect", redirect);
//     } else {
//       $("#validationModal").data("redirect", "");
//     }
//     $("#validationModal").fadeIn();
//   }
// });

$(document).ready(function() {
  // Preload background image
  let bgImage = new Image();
  bgImage.src = "/img/studybeta.jpg";
  bgImage.onload = function() {
    $("body").css({
      "background-image": "url('/img/studybeta.jpg')",
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

  // Show join modal when Join button is clicked
  $("#join-btn").click(function() {
    $("#join-pin").val("");          // Clear previous input
    $("#joinModal").fadeIn();
  });

  // Hide join modal when the close (×) button is clicked
  $(".close-button").click(function() {
    $("#joinModal").fadeOut();
  });

  $('#burger-icon').click(function () {
    $('#sidebar').toggleClass('open');
  });
  
  // Handle join submission from within the join modal
  $("#modal-join-btn").click(function() {
    const pin_code = $("#join-pin").val().trim();
    if (pin_code === "") {
      showValidationModal("Please enter a game pin code", false);
      return;
    }
    $.ajax({
      type: "POST",
      url: "/joingame",
      dataType: "json",
      data: { pin_code: pin_code },
      success: function(response) {
        if (response.success) {
          showValidationModal("Successful join!", true, response.redirect);
        } else {
          showValidationModal(response.message, false);
        }
      },
      error: function() {
        showValidationModal("An error occurred. Please try again.", false);
      }
    });
  });

  // When the OK button in the nested validation modal is clicked, immediately redirect
  $("#validation-ok-btn").click(function() {
    var redirectUrl = $("#validationModal").data("redirect");
    $("#validationModal").hide();
    $("#joinModal").hide();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/homepage";
    }
  });

  // Optional: hide join modal if clicking outside of modal-content
  $(window).click(function(event) {
    if ($(event.target).is("#joinModal")) {
      $("#joinModal").fadeOut();
    }
  });

  // Function to show the nested validation modal
  // message: text to display, success: true if join succeeded, redirect (optional) for success redirect
  function showValidationModal(message, success, redirect) {
    $("#validation-message").text(message);
    if (success && redirect) {
      $("#validationModal").data("redirect", redirect);
    } else {
      $("#validationModal").data("redirect", "");
    }
    $("#validationModal").fadeIn();
  }
});
