// let qrScanner; // make scanner global so we can stop it later

// $(document).ready(function () {
//   qrScanner = new Html5Qrcode("reader");

//   const config = {
//     fps: 10
//   };

//   function onScanSuccess(decodedText, decodedResult) {
//     console.log("Scanned QR:", decodedText);

//     const parts = decodedText.split('/');
//     if (parts.length !== 3) {
//       alert("Invalid QR format.");
//       return;
//     }

//     const [type, difficulty, value] = parts;

//     // ✅ AJAX call to backend route
//     $.get(`/qrquestion/${type}/${difficulty}/${value}`, function (data) {
//       if (!data.success) {
//         alert("No matching question found.");
//         return;
//       }

//       const q = data.question;
//       const options = data.options;

//       // ✅ Show question text
//       $("#question-text").text(q.text);

//       // ✅ Populate options
//       $(".option-btn").each(function (index) {
//         $(this).text(options[index].option_text);
//         $(this).data("isCorrect", options[index].is_correct);
//         $(this).data("reason", options[index].reason); // needed if correct
//       });

//       $("#questionModal").fadeIn(); // ✅ show modal

//       // ✅ Stop camera
//       qrScanner.stop().then(() => {
//         console.log("Scanner stopped after successful scan.");
//       }).catch((err) => {
//         console.error("Error stopping scanner:", err);
//       });
//     }).fail(() => {
//       alert("Error fetching question.");
//     });
//   }

//   // ✅ Start scanner
//   qrScanner.start(
//     { facingMode: "environment" },
//     config,
//     onScanSuccess,
//     (errMsg) => {
//       console.warn("QR scan error", errMsg);
//     }
//   ).catch((err) => {
//     alert("⚠️ Cannot start camera. Please check permission or close other apps.");
//     console.error("Scanner start error:", err);
//   });
// });

// // ✅ Stop scanner when tab closes, page reloads, or user leaves
// window.addEventListener("beforeunload", function () {
//   if (qrScanner) {
//     qrScanner.stop().then(() => {
//       console.log("Scanner stopped on page unload.");
//     }).catch((err) => {
//       console.log("Error stopping camera:", err);
//     });
//   }
// });

let qrScanner;
let scannedQuestion = null; // store scanned question globally

$(document).ready(function () {
  qrScanner = new Html5Qrcode("reader");

  const config = { fps: 10 };

  function onScanSuccess(decodedText) {
    const parts = decodedText.split('/');
    if (parts.length !== 3) {
      alert("Invalid QR format.");
      return;
    }

    const [type, difficulty, value] = parts;

    // Get question from backend
    $.get(`/qrquestion/${type}/${difficulty}/${value}`, function (data) {
      if (!data.success) {
        alert("No matching question found.");
        return;
      }

      scannedQuestion = data.question;

      $("#question-text").text(scannedQuestion.text);
      $(".option-btn").each(function (index) {
        const option = data.options[index];
        $(this).text(option.option_text);
        $(this).data("isCorrect", option.is_correct);
        $(this).data("reason", option.reason || "");
        $(this).data("answer", option.option_text);
      });

      $("#questionModal").fadeIn();

      qrScanner.stop().catch(() => {});
    });
  }

  // Start scanner
  qrScanner.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    (errMsg) => {
      console.warn("Scan error:", errMsg);
    }
  ).catch((err) => {
    alert("⚠️ Cannot start camera. Please check permission.");
    console.error("Scanner start error:", err);
  });

  // Stop scanner on page unload
  window.addEventListener("beforeunload", function () {
    if (qrScanner) {
      qrScanner.stop().catch(() => {});
    }
  });

  // ✅ When player selects an option
  $(".option-btn").click(function () {
    const isCorrect = $(this).data("isCorrect") == 1;
    const selectedAnswer = $(this).data("answer");

    $("#questionModal").fadeOut();

    if (isCorrect) {
      // ✅ CORRECT: Apply HP effect
      $.post("/submit-answer", {
        type: scannedQuestion.card_type,
        value: scannedQuestion.effect_value
      }, function () {
        $("#result-title").text("Correct!");
        $("#result-message").text(`Yes, "${selectedAnswer}" is correct.`);
        $("#resultModal").fadeIn();
      });
    } else {
      // ❌ WRONG: Find actual correct option and reason
      let correctAnswer = "";
      let correctReason = "";

      $(".option-btn").each(function () {
        if ($(this).data("isCorrect") == 1) {
          correctAnswer = $(this).data("answer");
          correctReason = $(this).data("reason");
        }
      });

      $("#result-title").text("Wrong Answer");
      $("#result-message").text(`Correct answer: "${correctAnswer}".\nReason: ${correctReason}`);
      $("#resultModal").fadeIn();
    }
  });

  // ✅ Return to scoreboard after OK
  $("#result-ok-btn").click(function () {
    window.location.href = "/startgame";
  });
});

