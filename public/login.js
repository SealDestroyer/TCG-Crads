$(document).ready(function () {
  $("#login-form").submit(function (event) {
    event.preventDefault(); // Prevent default form submission

    let email = $("#email").val().trim();
    let password = $("#password").val().trim();
    let errorMessage = "";

    // Custom frontend validation for empty fields
    if (email === "") {
      errorMessage = "Please enter your email.";
      $("#email").addClass("input-error");
    } else {
      $("#email").removeClass("input-error");
    }

    if (password === "") {
      // If email was already empty, append additional message
      errorMessage += errorMessage ? " Please enter your password." : "Please enter your password.";
      $("#password").addClass("input-error");
    } else {
      $("#password").removeClass("input-error");
    }

    if (errorMessage !== "") {
      $(".error-message").text(errorMessage).addClass("active");
      return;
    } else {
      // Remove error message if there are no errors
      $(".error-message").text("").removeClass("active");
    }

    // Show loading effect
    $(".login-button").prop("disabled", true).text("Logging in...");

    // AJAX request to validate credentials
    $.ajax({
      type: "POST",
      url: "/login",
      data: { email: email, password: password },
      dataType: "json",
      success: function (response) {
        if (response.success) {
          window.location.href = response.redirect; // Redirect on success
        } else {
          $(".error-message").text(response.message).addClass("active");
          $(".login-button").prop("disabled", false).text("Login"); // Re-enable button
        }
      },
      error: function () {
        $(".error-message").text("An error occurred. Please try again.").addClass("active");
        $(".login-button").prop("disabled", false).text("Login"); // Re-enable button on failure
      },
    });
  });
});
