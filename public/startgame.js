// $(document).ready(function () {
//     let gamePolling = null;

//     function pollGameState() {
//         $.ajax({
//             url: '/gamestate',
//             method: 'GET',
//             dataType: 'json',
//             success: function (res) {
//                 if (!res.success || res.game_ended) {
//                     clearInterval(gamePolling);

//                     // Check which player lost
//                     const p1_hp = parseInt($(".player").eq(0).find(".hp").text());
//                     const p2_hp = parseInt($(".player").eq(1).find(".hp").text());

//                     // Show modal for winner
//                     if (p1_hp === 0) {
//                         showWinnerModal($(".player-name").eq(1).text());
//                     } else if (p2_hp === 0) {
//                         showWinnerModal($(".player-name").eq(0).text());
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
//                     window.location.href = "/homepage"; // loser exits immediately
//                 }
//             },
//             error: function () {
//                 alert("Error exiting game.");
//             }
//         });
//     });

//     // ✅ Show winner modal
//     function showWinnerModal(winnerName) {
//         $("#winner-name").text(winnerName);
//         $("#winModal").fadeIn();
//     }

//     // ✅ Winner clicks OK → return to homepage
//     $("#win-ok-btn").click(function () {
//         window.location.href = "/homepage";
//     });

//     // ✅ Start polling for real-time game end detection
//     gamePolling = setInterval(pollGameState, 2000);
// });

$(document).ready(function () {
    let gamePolling = null;

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

                    if (res.player_one_hp === 0) {
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

    // ✅ Show winner modal with name
    function showWinnerModal(winnerName) {
        $("#winner-name").text(winnerName);
        $("#winModal").fadeIn();
    }

    // ✅ Winner clicks OK → go to homepage
    $("#win-ok-btn").click(function () {
        window.location.href = "/homepage";
    });

    // ✅ Start polling for real-time updates
    gamePolling = setInterval(pollGameState, 2000);
});
