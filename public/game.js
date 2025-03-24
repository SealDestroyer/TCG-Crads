// $(document).ready(function () {
//   let gameActive = true; // Track if the game is still active

//   function updateGameState() {
//       if (!gameActive) return; // Stop polling if game is no longer active

//       $.ajax({
//           url: '/gamestate',
//           method: 'GET',
//           dataType: 'json',
//           success: function (response) {
//               if (response.success) {
//                   // ✅ Update leaderboard dynamically
//                   $("#player-one").text("Player 1: " + response.player_one_name);
//                   $("#player-two").text("Player 2: " + (response.player_two_name || "Waiting..."));

//                   // ✅ Highlight Player 2 when they join
//                   if (response.player_two_name) {
//                       $("#player-two").addClass("player-joined");
//                   }

//                   // ✅ Enable Start Game button if Player 2 has joined
//                   if (response.is_player_one) {
//                       $("#start-game").prop("disabled", !response.player_two_name);
//                   }
//               } else {
//                   console.log("Game ended. Redirecting...");
//                   gameActive = false; // Stop polling
//                   window.location.href = "/homepage"; // Redirect once
//               }
//           },
//           error: function () {
//               console.log("Error fetching game state.");
//           }
//       });
//   }

//   // Fetch game state every 2 seconds (2000ms)
//   updateGameState();
//   const gamePolling = setInterval(updateGameState, 2000);

//   // ✅ Handle Cancel Game (Only Player 1 can do this)
//   $("#cancel-game").click(function () {
//       $.ajax({
//           url: "/cancelgame",
//           method: "POST",
//           dataType: "json",
//           success: function (response) {
//               if (response.success) {
//                   gameActive = false; // Stop polling
//                   clearInterval(gamePolling); // Prevent further requests
//                   window.location.href = response.redirect;
//               } else {
//                   alert(response.message);
//               }
//           },
//           error: function () {
//               alert("Error canceling game.");
//           }
//       });
//   });

//   // ✅ Handle Start Game
//   $("#start-game").click(function () {
//       window.location.href = '/startgame';
//   });
// });

$(document).ready(function () {
    let gameActive = true;

    function updateGameState() {
        if (!gameActive) return;

        $.ajax({
            url: '/gamestate',
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $("#player-one").text("Player 1: " + response.player_one_name);
                    $("#player-two").text("Player 2: " + (response.player_two_name || "Waiting..."));

                    if (response.is_player_one) {
                        $("#start-game").prop("disabled", !response.player_two_name);
                    }

                    // ✅ Redirect Player 2 if game has started
                    if (!response.is_player_one && response.game_started) {
                        window.location.href = "/startgame";
                    }
                } else {
                    console.log("Game ended or invalid.");
                    gameActive = false;
                    window.location.href = "/homepage";
                }
            },
            error: function () {
                console.log("Error fetching game state.");
            }
        });
    }

    // Poll every 2 seconds
    updateGameState();
    const gamePolling = setInterval(updateGameState, 2000);

    // ✅ Cancel Game button
    $("#cancel-game").click(function () {
        $.ajax({
            url: "/cancelgame",
            method: "POST",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    gameActive = false;
                    clearInterval(gamePolling);
                    window.location.href = response.redirect;
                } else {
                    alert(response.message);
                }
            },
            error: function () {
                alert("Error canceling game.");
            }
        });
    });

    // ✅ Start Game button (Player 1 only)
    $("#start-game").click(function () {
        $.ajax({
            url: "/startmatch",
            method: "POST",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    window.location.href = "/startgame";
                } else {
                    alert(response.message || "Could not start game.");
                }
            },
            error: function () {
                alert("Error starting game.");
            }
        });
    });
});
