const express = require('express');

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  // POST /cancelgame: Cancel the game session if the current user is the host (player one)
  router.post('/cancelgame', checkLoggedIn, (req, res) => {
    const studentId = req.session.student_id;
    const game_id = req.session.game_id; // Retrieve the active game session from the session

    if (!game_id) {
      return res.json({ success: false, message: "No active game found in session" });
    }

    // Verify that the current student is the host (player one) for this game session
    const query = `
      SELECT game_id, is_player_one 
      FROM game_players 
      WHERE student_id = ? AND game_id = ?
    `;
    db.query(query, [studentId, game_id], (err, results) => {
      if (err || results.length === 0) {
        console.error("Error fetching game session", err);
        return res.json({ success: false, message: "No active game found" });
      }
      const gameSession = results[0];
      if (!gameSession.is_player_one) {
        return res.json({ success: false, message: "Only the host can cancel the game" });
      }

      // Delete the game session records from game_players first
      const deleteGamePlayersQuery = `DELETE FROM game_players WHERE game_id = ?`;
      db.query(deleteGamePlayersQuery, [game_id], (err2, result2) => {
        if (err2) {
          console.error("Error deleting game players", err2);
          return res.json({ success: false, message: "Error cancelling game" });
        }
        // Then delete the game record from the game table using the game_id
        const deleteGameQuery = `DELETE FROM game WHERE game_id = ?`;
        db.query(deleteGameQuery, [game_id], (err3, result3) => {
          if (err3) {
            console.error("Error deleting game", err3);
            return res.json({ success: false, message: "Error cancelling game" });
          }
          // Clear the game_id from the session as the game is now cancelled
          req.session.game_id = null;
          return res.json({ success: true, redirect: '/homepage' });
        });
      });
    });
  });

  return router;
};
