// $(document).ready(function () {
//     let gamePolling = null;

//     function pollGameState() {
//         $.ajax({
//             url: '/gamestate',
//             method: 'GET',
//             dataType: 'json',
//             success: function (res) {
//                 if (!res.success) return;

//                 // ✅ Live update player names and HP
//                 $(".player-name").eq(0).text(res.player_one_name);
//                 $(".hp").eq(0).text(res.player_one_hp + " HP");

//                 $(".player-name").eq(1).text(res.player_two_name);
//                 $(".hp").eq(1).text(res.player_two_hp + " HP");

//                 // ✅ If game has ended, determine and show winner
//                 if (res.game_ended) {
//                     clearInterval(gamePolling);

//                     if (res.player_one_hp === 0) {
//                         showWinnerModal(res.player_two_name);
//                     } else if (res.player_two_hp === 0) {
//                         showWinnerModal(res.player_one_name);
//                     }
//                 }
//             },
//             error: function () {
//                 console.log("Error polling game state.");
//             }
//         });
//     }

//     // ✅ Exit Game button logic
//     $("#exit-game").click(function () {
//         $.ajax({
//             url: "/exitgame",
//             method: "POST",
//             dataType: "json",
//             success: function (res) {
//                 if (res.success && res.loser) {
//                     window.location.href = "/homepage"; // Loser exits immediately
//                 }
//             },
//             error: function () {
//                 alert("Error exiting game.");
//             }
//         });
//     });

//     // ✅ Show winner modal with name
//     function showWinnerModal(winnerName) {
//         $("#winner-name").text(winnerName);
//         $("#winModal").fadeIn();
//     }

//     // ✅ Winner clicks OK → go to homepage
//     $("#win-ok-btn").click(function () {
//         window.location.href = "/homepage";
//     });

//     // ▶️ Scan QR Button → Go to scanQR UI
//     $("#qr-scanner").click(function () {
//         window.location.href = "/scanqr";
//     });

//     // ✅ Start polling for real-time updates
//     gamePolling = setInterval(pollGameState, 2000);
// });


$(document).ready(function () {
    let gamePolling = null;
    let timerInterval = null;
    let gameDuration = 600; // 10 minutes in seconds

    function pollGameState() {
        $.ajax({
            url: '/gamestate',
            method: 'GET',
            dataType: 'json',
            success: function (res) {
                if (!res.success) return;

                // ✅ Live update player names and HP
                $(".player-name").eq(0).text(res.player_one_name);
                $(".hp").eq(0).text(res.player_one_hp + " HP");

                $(".player-name").eq(1).text(res.player_two_name);
                $(".hp").eq(1).text(res.player_two_hp + " HP");

                // ✅ If game has ended, determine and show winner
                if (res.game_ended) {
                    clearInterval(gamePolling);
                    clearInterval(timerInterval); // ⏹️ Stop game timer

                    if (res.player_one_hp === 0 && res.player_two_hp === 0) {
                        showTieModal();
                    } else if (res.player_one_hp === 0) {
                        showWinnerModal(res.player_two_name);
                    } else if (res.player_two_hp === 0) {
                        showWinnerModal(res.player_one_name);
                    }
                }
            },
            error: function () {
                console.log("Error polling game state.");
            }
        });
    }

    // ✅ Start the 6-minute timer
    function startGameTimer() {
        updateTimerDisplay(gameDuration);

        timerInterval = setInterval(() => {
            gameDuration--;
            updateTimerDisplay(gameDuration);

            if (gameDuration <= 0) {
                clearInterval(timerInterval);
                clearInterval(gamePolling);

                endGameByTimeout(); // ⏱️ Final HP check
            }
        }, 1000);
    }

    // ✅ Update timer on screen
    function updateTimerDisplay(seconds) {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        $("#game-timer").text(`${mins}:${secs}`);
    }

    // ✅ AJAX to trigger timeout backend logic
    function endGameByTimeout() {
        $.ajax({
            url: "/timeout",
            method: "POST",
            dataType: "json",
            success: function (res) {
                if (res.tie) {
                    showTieModal();
                } else if (res.winner_name) {
                    showWinnerModal(res.winner_name);
                }
            },
            error: function () {
                console.error("Timeout request failed.");
            }
        });
    }

    // ✅ Show winner modal with name
    function showWinnerModal(winnerName) {
        $("#winner-name").text(winnerName);
        $("#winModal h2").text("Congratulations Winner!");
        $("#winModal").fadeIn();
    }

    // ✅ Show tie modal
    function showTieModal() {
        $("#winner-name").text("It's a Tie!");
        $("#winModal h2").text("Tie Match!");
        $("#winModal").fadeIn();
    }

    // ✅ Exit Game button logic
    $("#exit-game").click(function () {
        $.ajax({
            url: "/exitgame",
            method: "POST",
            dataType: "json",
            success: function (res) {
                if (res.success && res.loser) {
                    window.location.href = "/homepage"; // Loser exits immediately
                }
            },
            error: function () {
                alert("Error exiting game.");
            }
        });
    });

    // ✅ Winner clicks OK → go to homepage
    $("#win-ok-btn").click(function () {
        window.location.href = "/homepage";
    });

    // ▶️ Scan QR Button → Go to scanQR UI
    $("#qr-scanner").click(function () {
        window.location.href = "/scanqr";
    });

    // ✅ Start polling and game timer
    gamePolling = setInterval(pollGameState, 2000);
    startGameTimer(); // 🎯 Start the 6-min timer!
});
