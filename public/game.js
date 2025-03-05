// $(document).ready(function () {
//     // Poll for game state updates every 1 second for near real-time updates
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
//             // If current user is host and second player exists, enable Start Game
//             if (response.player_two_name && response.is_player_one) {
//               $("#start-game").prop("disabled", false);
//             } else {
//               $("#start-game").prop("disabled", true);
//             }
//           }
//         },
//         error: function () {
//           console.log("Error fetching game state.");
//         }
//       });
//     }
//     // Start polling immediately and then every 1 second
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
  
//     // Handle Start Game button click to proceed to the actual gameplay page.
//     $("#start-game").click(function () {
//       window.location.href = '/gamestart';
//     });
// });

$(document).ready(function () {
    // Poll for game state updates every 500 milliseconds for near real-time updates
    function pollGameState() {
      $.ajax({
        type: 'GET',
        url: '/gamestate',
        dataType: 'json',
        success: function (response) {
          if (response.success) {
            // Update the leaderboard information
            $("#player-one").text("Player 1: " + response.player_one_name);
            $("#player-two").text("Player 2: " + (response.player_two_name || "Waiting..."));

            // If current user is host, enable the Start Game button only when player two exists
            if (response.is_player_one) {
              if (response.player_two_name) {
                $("#start-game").prop("disabled", false);
              } else {
                $("#start-game").prop("disabled", true);
              }
            }
          }
        },
        error: function () {
          console.log("Error fetching game state.");
        }
      });
    }
    
    // Start polling immediately and then every 500 milliseconds
    pollGameState();
    setInterval(pollGameState, 500);
  
    // Handle Cancel Game (only available for the host)
    $("#cancel-game").click(function () {
      $.ajax({
        type: "POST",
        url: "/cancelgame",
        dataType: "json",
        success: function (response) {
          if (response.success) {
            window.location.href = response.redirect;
          } else {
            alert(response.message);
          }
        },
        error: function () {
          alert("An error occurred while cancelling the game.");
        }
      });
    });
  
    // Handle Start Game button click (only available for the host)
    $("#start-game").click(function () {
      window.location.href = '/gamestart';
    });
});
