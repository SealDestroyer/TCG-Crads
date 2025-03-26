// const express = require('express');
// const router = express.Router();

// module.exports = (db) => {
//   router.post('/submit-answer', (req, res) => {
//     const student_id = req.session.student_id;
//     const game_id = req.session.game_id;

//     if (!student_id || !game_id) {
//       return res.status(401).json({ success: false, message: "Session expired." });
//     }

//     const { type, value } = req.body;

//     // Step 1: Get this player's role (player_one or player_two)
//     const getPlayerQuery = `
//       SELECT is_player_one 
//       FROM game_players 
//       WHERE game_id = ? AND student_id = ?
//     `;

//     db.query(getPlayerQuery, [game_id, student_id], (err, result) => {
//       if (err || result.length === 0) {
//         return res.status(400).json({ success: false, message: "Player not found." });
//       }

//       const isPlayerOne = result[0].is_player_one;

//       if (type === "damage") {
//         // Step 2: Damage opponent
//         const damageQuery = `
//           UPDATE game_players 
//           SET HP = GREATEST(0, HP - ?) 
//           WHERE game_id = ? AND is_player_one != ?
//         `;

//         db.query(damageQuery, [value, game_id, isPlayerOne], (err2) => {
//           if (err2) {
//             return res.status(500).json({ success: false, message: "Failed to damage opponent." });
//           }

//           // Step 3: Check if opponent HP is now 0
//           const checkOpponentQuery = `
//             SELECT HP FROM game_players 
//             WHERE game_id = ? AND is_player_one != ?
//           `;

//           db.query(checkOpponentQuery, [game_id, isPlayerOne], (err3, result3) => {
//             if (err3) {
//               return res.status(500).json({ success: false, message: "Failed to check opponent HP." });
//             }

//             const opponentHP = result3[0].HP;

//             if (opponentHP === 0) {
//               // Step 4: End the game if opponent died
//               const endGameQuery = `UPDATE game SET game_ended = 1 WHERE game_id = ?`;

//               db.query(endGameQuery, [game_id], (err4) => {
//                 if (err4) {
//                   return res.status(500).json({ success: false, message: "Failed to end game." });
//                 }

//                 return res.json({ success: true, gameEnded: true });
//               });

//             } else {
//               return res.json({ success: true });
//             }
//           });
//         });

//       } else if (type === "heal") {
//         // Step 2: Heal self (max 1000 HP)
//         const healQuery = `
//           UPDATE game_players 
//           SET HP = LEAST(1000, HP + ?) 
//           WHERE game_id = ? AND student_id = ?
//         `;

//         db.query(healQuery, [value, game_id, student_id], (err3) => {
//           if (err3) {
//             return res.status(500).json({ success: false, message: "Failed to heal." });
//           }

//           return res.json({ success: true });
//         });

//       } else {
//         return res.status(400).json({ success: false, message: "Invalid card type." });
//       }
//     });
//   });

//   return router;
// };


const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/submit-answer', (req, res) => {
    const student_id = req.session.student_id;
    const game_id = req.session.game_id;

    if (!student_id || !game_id) {
      return res.status(401).json({ success: false, message: "Session expired." });
    }

    const { type, value, question_id, option_id } = req.body;

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

      const insertAnswerQuery = `
        INSERT INTO answers (student_id, question_id, option_id, game_id)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertAnswerQuery, [student_id, question_id, option_id, game_id], (err2) => {
        if (err2) {
          console.error("Failed to insert into answers table:", err2);
          // Not blocking
        }
      });

      if (type === "damage") {
        const damageQuery = `
          UPDATE game_players 
          SET HP = GREATEST(0, HP - ?) 
          WHERE game_id = ? AND is_player_one != ?
        `;

        db.query(damageQuery, [value, game_id, isPlayerOne], (err2) => {
          if (err2) {
            return res.status(500).json({ success: false, message: "Failed to damage opponent." });
          }

          const checkOpponentQuery = `
            SELECT HP FROM game_players 
            WHERE game_id = ? AND is_player_one != ?
          `;

          db.query(checkOpponentQuery, [game_id, isPlayerOne], (err3, result3) => {
            if (err3) {
              return res.status(500).json({ success: false, message: "Failed to check opponent HP." });
            }

            const opponentHP = result3[0].HP;

            if (opponentHP === 0) {
              const endGameQuery = `UPDATE game SET game_ended = 1 WHERE game_id = ?`;

              db.query(endGameQuery, [game_id], (err4) => {
                if (err4) {
                  return res.status(500).json({ success: false, message: "Failed to end game." });
                }

                return res.json({ success: true, gameEnded: true });
              });

            } else {
              return res.json({ success: true });
            }
          });
        });

      } else if (type === "heal") {
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
