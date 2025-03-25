const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/submit-answer', (req, res) => {
    const student_id = req.session.student_id;
    const game_id = req.session.game_id;

    if (!student_id || !game_id) {
      return res.status(401).json({ success: false, message: "Session expired." });
    }

    const { type, value } = req.body;

    // Step 1: Get this player's role (player_one or player_two)
    const getPlayerQuery = `
      SELECT is_player_one 
      FROM game_players 
      WHERE game_id = ? AND student_id = ?
    `;

    db.query(getPlayerQuery, [game_id, student_id], (err, result) => {
      if (err || result.length === 0) {
        return res.status(400).json({ success: false, message: "Player not found." });
      }

      const isPlayerOne = result[0].is_player_one;

      if (type === "damage") {
        // Step 2: Damage opponent
        const opponentQuery = `
          UPDATE game_players 
          SET HP = GREATEST(0, HP - ?) 
          WHERE game_id = ? AND is_player_one != ?
        `;
        db.query(opponentQuery, [value, game_id, isPlayerOne], (err2) => {
          if (err2) {
            return res.status(500).json({ success: false, message: "Failed to damage opponent." });
          }
          return res.json({ success: true });
        });

      } else if (type === "heal") {
        // Step 3: Heal self (max 1000 HP)
        const healQuery = `
          UPDATE game_players 
          SET HP = LEAST(1000, HP + ?) 
          WHERE game_id = ? AND student_id = ?
        `;
        db.query(healQuery, [value, game_id, student_id], (err3) => {
          if (err3) {
            return res.status(500).json({ success: false, message: "Failed to heal." });
          }
          return res.json({ success: true });
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid card type." });
      }
    });
  });

  return router;
};
