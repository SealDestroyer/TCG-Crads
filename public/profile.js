$(document).ready(function () {
  // Background preload
  let bg = new Image();
  bg.src = "/img/test.jpg";  // The image is now in the /img folder inside public
  bg.onload = function () {
    $("body").css({
      "background-image": "url('/img/test.jpg')",
      "background-size": "cover",
      "background-repeat": "no-repeat",
      "background-position": "center center",
      "background-attachment": "fixed"
    });
  };

  // Handle the sidebar toggle on mobile
  $('#burger-icon').click(function () {
    $('#sidebar').toggleClass('open');
  });

  $.ajax({
    url: "/profile/data", // ✅ this endpoint returns JSON profile data
    method: "GET",
    dataType: "json",
    success: function (data) {
      if (data.success) {
        $("#name").val(data.name);
        $("#email").val(data.email);
        $("#contact").val(data.contact || "");
        $("#gender").val(data.gender || "");
        $("#profile-pic").attr(
          "src",
          data.profile_picture ? "/img/" + data.profile_picture : "/img/panda.jpg"
        );
  
        if (data.contact) $("#contact").data("locked", true);
        if (data.gender) $("#gender").data("locked", true);
      }
    },
    error: function () {
      alert("Failed to load profile.");
    }
  });  

  // 🟣 Show file name when the user selects a profile picture
  $("#upload-pic").on("change", function () {
    const fileName = this.files[0]?.name || "No file chosen";
    $("#file-name").text(fileName);
  });

  $(".save-btn").click(function (e) {
    e.preventDefault();
  
    const name = $("#name").val().trim();
    const email = $("#email").val().trim();
    const contact = $("#contact").val().trim();
    const gender = $("#gender").val();
  
    // 🛡️ Validate all required or locked fields before submitting
  
    if ($("#contact").data("locked") && contact === "") {
      showModal("Contact cannot be cleared once saved.");
      return;
    }
  
    if ($("#gender").data("locked") && gender === "") {
      showModal("Gender cannot be cleared once saved.");
      return;
    }
  
    if (name === "") {
      showModal("Name cannot be empty.");
      return;
    }
  
    if (email === "") {
      showModal("Email cannot be empty.");
      return;
    }
  
    // 🔄 No changes to save logic below...
    if (!name && !email && !contact && !gender && !$("#upload-pic")[0].files.length) {
      showModal("Nothing to update.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email); // Optional, only if you want to allow email updates
    formData.append("contact", contact);
    formData.append("gender", gender);
    if ($("#upload-pic")[0].files.length) {
      formData.append("profile_pic", $("#upload-pic")[0].files[0]);
    }
  
    $.ajax({
      url: "/profile",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.success) {
          showModal("Saved successfully!");
        } else {
          showModal(response.message || "Failed to save.");
        }
      },
      error: function () {
        showModal("An error occurred while saving.");
      }
    });
  });

  // 🔴 DELETE button logic
  $(".delete-btn").click(function () {
    $("#deleteModal").fadeIn();
  });

  $("#cancel-delete-btn").click(function () {
    $("#deleteModal").fadeOut();
  });

  $("#confirm-delete-btn").click(function () {
    $.ajax({
      url: "/profile/delete",  // Backend endpoint to delete user account
      method: "POST",
      success: function (res) {
        if (res.success) {
          window.location.href = "/login";  // Redirect to login after deletion
        } else {
          showModal(res.message || "Failed to delete account.");
        }
      },
      error: function () {
        showModal("An error occurred while deleting account.");
      }
    });
  });

  // ✅ Modal control
  function showModal(message) {
    $("#save-modal-text").text(message);
    $("#saveModal").fadeIn();
  }

  $("#save-ok-btn").click(function () {
    $("#saveModal").fadeOut();
    location.reload(); // optional: refresh locked state
  });

  $(window).click(function (event) {
    if ($(event.target).is("#saveModal")) {
      $("#saveModal").fadeOut();
    }
    if ($(event.target).is("#deleteModal")) {
      $("#deleteModal").fadeOut();
    }
  });
});
