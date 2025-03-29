$(document).ready(function () {
  // Background preload
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

  // 🟢 Load profile info on page load
  $.ajax({
    url: "/api/profile",
    method: "GET",
    dataType: "json",
    success: function (data) {
      if (data.success) {
        $("#name").val(data.name);
        $("#email").val(data.email);
        $("#contact").val(data.contact || "");
        $("#gender").val(data.gender || "");
        $("#profile-pic").attr("src", data.profile_pic ? "/uploads/profilepics/" + data.profile_pic : "/img/panda.jpg");

        // Lock contact/gender from being cleared once saved
        if (data.contact) $("#contact").data("locked", true);
        if (data.gender) $("#gender").data("locked", true);
      }
    },
    error: function () {
      alert("Failed to load profile.");
    }
  });

  // 🟣 Show file name when user selects profile picture
  $("#upload-pic").on("change", function () {
    const fileName = this.files[0]?.name || "No file chosen";
    $("#file-name").text(fileName);
  });

  // 🔵 SAVE button logic
  $(".save-btn").click(function (e) {
    e.preventDefault();

    const name = $("#name").val().trim();
    const contact = $("#contact").val().trim();
    const gender = $("#gender").val();

    // Prevent clearing locked fields
    if ($("#contact").data("locked") && contact === "") {
      showModal("Contact cannot be cleared once saved.");
      return;
    }
    if ($("#gender").data("locked") && gender === "") {
      showModal("Gender cannot be cleared once saved.");
      return;
    }

    // Check if any value to save
    if (!name && !contact && !gender && !$("#upload-pic")[0].files.length) {
      showModal("Nothing to update.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("contact", contact);
    formData.append("gender", gender);
    if ($("#upload-pic")[0].files.length) {
      formData.append("profile_pic", $("#upload-pic")[0].files[0]);
    }

    $.ajax({
      url: "/api/profile",
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
      url: "/api/profile/delete",
      method: "POST",
      success: function (res) {
        if (res.success) {
          window.location.href = "/login";
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
    location.reload(); // optional: reload to refresh locked state
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
