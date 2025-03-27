let qrScanner;
let scannedQuestion = null;
let answeringNow = false; 
let questionTimer = 30;
let questionTimerInterval = null;
let gamePollingInterval = null;

$(document).ready(function () {
  qrScanner = new Html5Qrcode("reader");

  const config = { fps: 10 };

  function onScanSuccess(decodedText) {
    // ✅ ADDED: Block scanning if already answering
    if (answeringNow) return;

    const parts = decodedText.split('/');
    if (parts.length !== 3) {
      alert("Invalid QR format.");
      return;
    }

    const [type, difficulty, value] = parts;

    $.get(`/qrquestion/${type}/${difficulty}/${value}`, function (data) {
      if (!data.success) {
        if (data.message.includes("Wait")) {
          $("#lock-message").text(data.message);
          $("#lockModal").fadeIn();
        } else {
          alert(data.message);
        }
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
        $(this).data("optionId", option.option_id);
      });

      $("#questionModal").fadeIn();
      answeringNow = true;                              
      startQuestionTimer();
      gamePollingInterval = setInterval(pollGameEnd, 2000);
      qrScanner.stop().catch(() => {});
    });
  }

  function pollGameEnd() {
    $.get("/gamestate", function (res) {
      if (res && res.game_ended) {
        clearInterval(gamePollingInterval);
        clearInterval(questionTimerInterval);
        answeringNow = false;
  
        $.post("/submit-answer", {
          type: "timeout",
          value: 0,
          question_id: scannedQuestion?.id || 0,
          option_id: null
        }, function (res) {
          console.log("🟡 Response from /submit-answer:", res);
  
          if (!res || typeof res.gameEnded === "undefined") {
            window.location.href = "/startgame";
            return;
          }
  
          if (res.gameEnded) {
            console.log("💥 Force-clearing all modals");
  
            // ✅ Hide any leftover modals before redirect
            $("#questionModal").hide();
            $("#resultModal").hide();
            $("#lockModal").hide();
            $(".modal").hide(); // fallback
  
            let redirectUrl = "/startgame";
  
            if (res.isTie) {
              console.log("🤝 It's a tie");
              redirectUrl += "?result=tie";
            } else {
              const winnerName = res.winner_name || "Winner";
              console.log("🏆 Redirecting with winner:", winnerName);
              redirectUrl += "?result=win&name=" + encodeURIComponent(winnerName);
            }
  
            window.location.href = redirectUrl;
          } else {
            window.location.href = "/startgame";
          }
        }).fail(function (jqXHR, textStatus, errorThrown) {
          console.error("❌ AJAX to /submit-answer failed:", textStatus, errorThrown);
          window.location.href = "/startgame";
        });
      }
    });
  }
  
  // ✅ NEW: Timer logic
  function startQuestionTimer() {
    clearInterval(questionTimerInterval);
    questionTimer = 30;
    $("#question-timer").text(`${questionTimer}s`);

    questionTimerInterval = setInterval(() => {
      questionTimer--;
      $("#question-timer").text(`${questionTimer}s`);

      if (questionTimer <= 0) {
        clearInterval(questionTimerInterval);
        clearInterval(gamePollingInterval);
        answeringNow = false;                         
        $("#questionModal").fadeOut();

        // Show timeout result modal
        $("#result-title").text("Time's Up!");
        $("#result-message").text("You missed your chance to answer.");
        $("#resultModal").fadeIn();

        // Send to backend to unlock player
        $.post("/submit-answer", {
          type: "timeout",
          value: 0,
          question_id: scannedQuestion.id,
          option_id: null
        });

        // Redirect after user clicks OK
        $("#result-ok-btn").off("click").on("click", function () {
          window.location.href = "/startgame";
        });
      }
    }, 1000);
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
    clearInterval(questionTimerInterval);
    clearInterval(gamePollingInterval);
    answeringNow = false;                        

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

      $.post("/submit-answer", payload);

      $("#result-title").text("Wrong Answer");
      $("#result-message").html(`Correct answer: "${correctAnswer}".<br>Reason: ${correctReason}`);
      $("#resultModal").fadeIn();
    }
  });

  $("#result-ok-btn").click(function () {
    window.location.href = "/startgame";
  });

  $("#lock-ok-btn").click(function () {
    window.location.href = "/startgame";
  });
});
