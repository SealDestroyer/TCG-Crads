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
