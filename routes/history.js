const express = require("express");

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  router.get("/history", checkLoggedIn, (req, res) => {
    const studentId = req.session.student_id;

    const query = `
      SELECT 
        g.game_id,
        g.game_ended,
        gp1.HP AS my_hp,
        gp2.HP AS opponent_hp,
        s2.name AS opponent_name
      FROM game g
      JOIN game_players gp1 ON g.game_id = gp1.game_id
      JOIN game_players gp2 ON g.game_id = gp2.game_id AND gp1.student_id != gp2.student_id
      JOIN student s2 ON gp2.student_id = s2.student_ID
      WHERE gp1.student_id = ?
        AND g.game_ended = 1
      ORDER BY g.game_id DESC
    `;

    db.query(query, [studentId], (err, results) => {
      if (err) {
        console.error("Error fetching history:", err);
        return res.render("history", { history: [] });
      }

      const history = results.map(row => {
        const result = row.my_hp > row.opponent_hp ? 'win' : 'loss';
        return {
          opponent_name: row.opponent_name,
          my_hp: row.my_hp,
          opponent_hp: row.opponent_hp,
          result
        };
      });

      res.render("history", { history });
    });
  });

  return router;
};
