const express = require('express');
const router = express.Router();

module.exports = (db, checkLoggedIn) => {
  router.post('/submit-answer', checkLoggedIn, (req, res) => {
    const student_id = req.session.student_id;
    const game_id = req.session.game_id;

    if (!student_id || !game_id) {
      return res.status(401).json({ success: false, message: "Session expired." });
    }

    if (req.body.type === "timeout") {
      console.log("🔔 Timeout triggered for game_id:", game_id, "by student_id:", student_id);
    
      db.query(
        `UPDATE game SET current_answering_player_id = NULL WHERE game_id = ?`,
        [game_id],
        (err) => {
          if (err) {
            console.error("❌ Failed to unlock player:", err);
            return res.status(500).json({ success: false });
          }
    
          console.log("✅ Player unlock successful, now checking game state...");
    
          const query = `
            SELECT 
              game_ended, 
              gp1.HP AS player_one_hp, 
              gp2.HP AS player_two_hp,
              gp1.student_id AS player_one_id,
              gp2.student_id AS player_two_id,
              s1.name AS player_one_name,
              s2.name AS player_two_name
            FROM game 
            JOIN game_players gp1 ON game.game_id = gp1.game_id AND gp1.is_player_one = 1
            JOIN student s1 ON gp1.student_id = s1.student_ID
            JOIN game_players gp2 ON game.game_id = gp2.game_id AND gp2.is_player_one = 0
            JOIN student s2 ON gp2.student_id = s2.student_ID
            WHERE game.game_id = ?
          `;
    
          db.query(query, [game_id], (err2, result) => {
            if (err2) {
              console.error("❌ Error fetching game state:", err2);
              return res.json({ success: false });
            }
    
            if (result.length === 0) {
              console.warn("⚠️ No game found for game_id:", game_id);
              return res.json({ success: true });
            }
    
            const row = result[0];
            const gameEnded = row.game_ended === 1;
            const playerOneHP = row.player_one_hp;
            const playerTwoHP = row.player_two_hp;
            const playerOneId = row.player_one_id;
            const playerTwoId = row.player_two_id;
            const playerOneName = row.player_one_name;
            const playerTwoName = row.player_two_name;
    
            console.log("📊 Game ended:", gameEnded);
            console.log("❤️ P1 HP:", playerOneHP, "| P2 HP:", playerTwoHP);
            console.log("👤 P1 ID:", playerOneId, "| P2 ID:", playerTwoId);
    
            let isTie = false;
            let winner_id = null;
            let winner_name = null;
    
            if (gameEnded) {
              if (playerOneHP === playerTwoHP) {
                isTie = true;
                console.log("🤝 It's a tie");
              } else {
                const isPlayerOneWinner = playerOneHP > playerTwoHP;
                winner_id = isPlayerOneWinner ? playerOneId : playerTwoId;
                winner_name = isPlayerOneWinner ? playerOneName : playerTwoName;
                console.log("🏆 Winner ID:", winner_id, "| Name:", winner_name);
              }
            } else {
              console.log("🕐 Game not yet ended");
            }
    
            return res.json({
              success: true,
              gameEnded,
              isTie,
              winner_id,
              winner_name,
              current_player_id: student_id
            });
          });
        }
      );
    
      return; // prevent further processing
    }
         

    const { type, value, question_id, option_id } = req.body;

    // Step 1: Get player role (to know opponent)
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

      // Step 2: Check if the selected answer is correct
      const correctnessQuery = `SELECT is_correct FROM question_option WHERE option_id = ?`;

      db.query(correctnessQuery, [option_id], (errCheck, resultCheck) => {
        if (errCheck || resultCheck.length === 0) {
          return res.status(400).json({ success: false, message: "Invalid option." });
        }

        const isCorrect = resultCheck[0].is_correct === 1;

        // Step 3: Record the answer
        const insertAnswerQuery = `
          INSERT INTO answers (student_id, question_id, option_id, game_id)
          VALUES (?, ?, ?, ?)
        `;

        db.query(insertAnswerQuery, [student_id, question_id, option_id, game_id], (errInsert) => {
          if (errInsert) {
            console.error("Failed to insert into answers table:", errInsert);
          }
        });

        // ✅ Clear the lock after answer
        db.query(`UPDATE game SET current_answering_player_id = NULL WHERE game_id = ?`, [game_id]);

        // Step 4: If wrong answer, stop here
        if (!isCorrect) {
          return res.json({ success: true, correct: false });
        }

        // Step 5: Apply effects if correct
        if (type === "damage") {
          const damageQuery = `
            UPDATE game_players 
            SET HP = GREATEST(0, HP - ?) 
            WHERE game_id = ? AND is_player_one != ?
          `;

          db.query(damageQuery, [value, game_id, isPlayerOne], (err2) => {
            if (err2) {
              return res.status(500).json({ success: false, message: "Failed to apply damage." });
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

                  return res.json({ success: true, correct: true, gameEnded: true });
                });

              } else {
                return res.json({ success: true, correct: true });
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
              return res.status(500).json({ success: false, message: "Failed to apply healing." });
            }

            return res.json({ success: true, correct: true });
          });

        } else {
          return res.status(400).json({ success: false, message: "Invalid card type." });
        }
      });
    });
  });

  return router;
};
