// let qrScanner;
// let scannedQuestion = null; // store scanned question globally

// $(document).ready(function () {
//   qrScanner = new Html5Qrcode("reader");

//   const config = { fps: 10 };

//   function onScanSuccess(decodedText) {
//     const parts = decodedText.split('/');
//     if (parts.length !== 3) {
//       alert("Invalid QR format.");
//       return;
//     }

//     const [type, difficulty, value] = parts;

//     // Get question from backend
//     $.get(`/qrquestion/${type}/${difficulty}/${value}`, function (data) {
//       if (!data.success) {
//         alert("No matching question found.");
//         return;
//       }

//       scannedQuestion = data.question;

//       $("#question-text").text(scannedQuestion.text);
//       $(".option-btn").each(function (index) {
//         const option = data.options[index];
//         $(this).text(option.option_text);
//         $(this).data("isCorrect", option.is_correct);
//         $(this).data("reason", option.reason || "");
//         $(this).data("answer", option.option_text);
//       });

//       $("#questionModal").fadeIn();

//       qrScanner.stop().catch(() => {});
//     });
//   }

//   // Start scanner
//   qrScanner.start(
//     { facingMode: "environment" },
//     config,
//     onScanSuccess,
//     (errMsg) => {
//       console.warn("Scan error:", errMsg);
//     }
//   ).catch((err) => {
//     alert("⚠️ Cannot start camera. Please check permission.");
//     console.error("Scanner start error:", err);
//   });

//   // Stop scanner on page unload
//   window.addEventListener("beforeunload", function () {
//     if (qrScanner) {
//       qrScanner.stop().catch(() => {});
//     }
//   });

//   // ✅ When player selects an option
//   $(".option-btn").click(function () {
//     const isCorrect = $(this).data("isCorrect") == 1;
//     const selectedAnswer = $(this).data("answer");

//     $("#questionModal").fadeOut();

//     if (isCorrect) {
//       // ✅ CORRECT: Apply HP effect
//       $.post("/submit-answer", {
//         type: scannedQuestion.card_type,
//         value: scannedQuestion.effect_value
//       }, function () {
//         $("#result-title").text("Correct!");
//         $("#result-message").text(`Yes, "${selectedAnswer}" is correct.`);
//         $("#resultModal").fadeIn();
//       });
//     } else {
//       // ❌ WRONG: Find actual correct option and reason
//       let correctAnswer = "";
//       let correctReason = "";

//       $(".option-btn").each(function () {
//         if ($(this).data("isCorrect") == 1) {
//           correctAnswer = $(this).data("answer");
//           correctReason = $(this).data("reason");
//         }
//       });

//       $("#result-title").text("Wrong Answer");
//       $("#result-message").text(`Correct answer: "${correctAnswer}".\nReason: ${correctReason}`);
//       $("#resultModal").fadeIn();
//     }
//   });

//   // ✅ Return to scoreboard after OK
//   $("#result-ok-btn").click(function () {
//     window.location.href = "/startgame";
//   });
// });

let qrScanner;
let scannedQuestion = null;

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
        $(this).data("optionId", option.option_id); // ✅ new
      });

      $("#questionModal").fadeIn();
      qrScanner.stop().catch(() => {});
    });
  }

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

  window.addEventListener("beforeunload", function () {
    if (qrScanner) {
      qrScanner.stop().catch(() => {});
    }
  });

  $(".option-btn").click(function () {
    const isCorrect = $(this).data("isCorrect") == 1;
    const selectedAnswer = $(this).data("answer");
    const optionId = $(this).data("optionId");

    $("#questionModal").fadeOut();

    const payload = {
      type: scannedQuestion.card_type,
      value: scannedQuestion.effect_value,
      question_id: scannedQuestion.id,      
      option_id: optionId                   
    };

    if (isCorrect) {
      $.post("/submit-answer", payload, function () {
        $("#result-title").text("Correct!");
        $("#result-message").text(`Yes, "${selectedAnswer}" is correct.`);
        $("#resultModal").fadeIn();
      });
    } else {
      let correctAnswer = "", correctReason = "";

      $(".option-btn").each(function () {
        if ($(this).data("isCorrect") == 1) {
          correctAnswer = $(this).data("answer");
          correctReason = $(this).data("reason");
        }
      });

      $.post("/submit-answer", payload); // ✅ still store wrong answer

      $("#result-title").text("Wrong Answer");
      $("#result-message").text(`Correct answer: "${correctAnswer}".\nReason: ${correctReason}`);
      $("#resultModal").fadeIn();
    }
  });

  $("#result-ok-btn").click(function () {
    window.location.href = "/startgame";
  });
});
