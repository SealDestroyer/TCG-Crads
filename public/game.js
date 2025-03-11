// $(document).ready(function () {
//     // Poll for game state updates every 500 milliseconds for near real-time updates
//     function pollGameState() {
//       $.ajax({
//         type: 'GET',
//         url: '/gamestate',
//         dataType: 'json',
//         success: function (response) {
//           if (response.success) {
//             // Update the leaderboard information
//             $("#player-one").text("Player 1: " + response.player_one_name);
//             $("#player-two").text("Player 2: " + (response.player_two_name || "Waiting..."));

//             // If current user is host, enable the Start Game button only when player two exists
//             if (response.is_player_one) {
//               if (response.player_two_name) {
//                 $("#start-game").prop("disabled", false);
//               } else {
//                 $("#start-game").prop("disabled", true);
//               }
//             }
//           }
//         },
//         error: function () {
//           console.log("Error fetching game state.");
//         }
//       });
//     }
    
//     // Start polling immediately and then every 500 milliseconds
//     pollGameState();
//     setInterval(pollGameState, 500);
  
//     // Handle Cancel Game (only available for the host)
//     $("#cancel-game").click(function () {
//       $.ajax({
//         type: "POST",
//         url: "/cancelgame",
//         dataType: "json",
//         success: function (response) {
//           if (response.success) {
//             window.location.href = response.redirect;
//           } else {
//             alert(response.message);
//           }
//         },
//         error: function () {
//           alert("An error occurred while cancelling the game.");
//         }
//       });
//     });
  
//     // Handle Start Game button click (only available for the host)
//     $("#start-game").click(function () {
//       window.location.href = '/gamestart';
//     });
// });

$(document).ready(function () {
  let gameActive = true; // Track if the game is still active

  function updateGameState() {
      if (!gameActive) return; // Stop polling if game is no longer active

      $.ajax({
          url: '/gamestate',
          method: 'GET',
          dataType: 'json',
          success: function (response) {
              if (response.success) {
                  // ✅ Update leaderboard dynamically
                  $("#player-one").text("Player 1: " + response.player_one_name);
                  $("#player-two").text("Player 2: " + (response.player_two_name || "Waiting..."));

                  // ✅ Highlight Player 2 when they join
                  if (response.player_two_name) {
                      $("#player-two").addClass("player-joined");
                  }

                  // ✅ Enable Start Game button if Player 2 has joined
                  if (response.is_player_one) {
                      $("#start-game").prop("disabled", !response.player_two_name);
                  }
              } else {
                  console.log("Game ended. Redirecting...");
                  gameActive = false; // Stop polling
                  window.location.href = "/homepage"; // Redirect once
              }
          },
          error: function () {
              console.log("Error fetching game state.");
          }
      });
  }

  // Fetch game state every 2 seconds (2000ms)
  updateGameState();
  const gamePolling = setInterval(updateGameState, 2000);

  // ✅ Handle Cancel Game (Only Player 1 can do this)
  $("#cancel-game").click(function () {
      $.ajax({
          url: "/cancelgame",
          method: "POST",
          dataType: "json",
          success: function (response) {
              if (response.success) {
                  gameActive = false; // Stop polling
                  clearInterval(gamePolling); // Prevent further requests
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

  // ✅ Handle Start Game
  $("#start-game").click(function () {
      window.location.href = '/startgame';
  });
});
