const express = require('express');
const router = express.Router();

module.exports = (db, checkLoggedIn) => {
  router.post('/joingame', checkLoggedIn, (req, res) => {
    const studentId = req.session.student_id;
    const pin_code = req.body.pin_code;
  
    // First, check if a game exists with the provided pin_code
    const findGameQuery = 'SELECT * FROM game WHERE pin_code = ?';
    db.query(findGameQuery, [pin_code], (err, games) => {
      if (err) {
        console.error("Error fetching game:", err);
        return res.json({ success: false, message: 'Error connecting to database' });
      }
      if (games.length === 0) {
        return res.json({ success: false, message: 'Invalid game code' });
      }
      const game = games[0];
      const game_id = game.game_id; // adjust field name as needed
  
      // Next, check how many players are already in the game
      const countPlayersQuery = 'SELECT COUNT(*) as count FROM game_players WHERE game_id = ?';
      db.query(countPlayersQuery, [game_id], (err, results) => {
        if (err) {
          console.error("Error checking players:", err);
          return res.json({ success: false, message: 'Error checking game room' });
        }
        const playerCount = results[0].count;
        if (playerCount >= 2) {
          return res.json({ success: false, message: 'Game room full' });
        }
        // Insert the new player as the second player (is_player_one = false)
        const insertPlayerQuery = 'INSERT INTO game_players (game_id, student_id, HP, is_player_one) VALUES (?, ?, 1000, false)';
        db.query(insertPlayerQuery, [game_id, studentId], (err, result) => {
          if (err) {
            console.error("Error joining game:", err);
            return res.json({ success: false, message: 'Error joining game' });
          }
          // On success, return the redirect to the game page
          return res.json({ success: true, redirect: '/game' });
        });
      });
    });
  });

  return router;
};
