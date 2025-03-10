// const express = require('express');

// module.exports = (db, checkLoggedIn) => {
//   const router = express.Router();

//   // GET /game: Render the game waiting room
//   router.get('/game', checkLoggedIn, (req, res) => {
//     const studentId = req.session.student_id;
//     const game_id = req.session.game_id; // Get the active game session from the session

//     if (!game_id) {
//       console.error("No active game session found in session.");
//       return res.redirect('/homepage');
//     }

//     // Query to find the game session using the session game_id and the current student
//     const query = `
//       SELECT gp.game_id, gp.student_id, gp.is_player_one, g.pin_code
//       FROM game_players gp
//       JOIN game g ON gp.game_id = g.game_id
//       WHERE gp.game_id = ? AND gp.student_id = ?
//     `;
//     db.query(query, [game_id, studentId], (err, results) => {
//       if (err || results.length === 0) {
//         console.error("Error fetching game session", err);
//         return res.redirect('/homepage');
//       }
//       const gameSession = results[0];
//       const pin_code = gameSession.pin_code;

//       // Query to get both players in the current game session along with their names from student table
//       const queryPlayers = `
//         SELECT gp.*, s.name 
//         FROM game_players gp 
//         JOIN student s ON gp.student_id = s.student_ID 
//         WHERE gp.game_id = ?
//       `;
//       db.query(queryPlayers, [game_id], (err2, playerResults) => {
//         if (err2) {
//           console.error("Error fetching players", err2);
//           return res.redirect('/homepage');
//         }
//         let player_one_name = "";
//         let player_two_name = "";
//         playerResults.forEach(player => {
//           if (player.is_player_one) {
//             player_one_name = player.name;
//           } else {
//             player_two_name = player.name;
//           }
//         });
//         // Determine if the current user is the host
//         const isPlayerOne = gameSession.is_player_one ? true : false;
//         res.render('game', {
//           pin_code,
//           player_one_name,
//           player_two_name: player_two_name || "Waiting...",
//           is_player_one: isPlayerOne
//         });
//       });
//     });
//   });

//   return router;
// };

const express = require('express');

module.exports = (db, checkLoggedIn) => {
    const router = express.Router();

    // ✅ Route to Render Game Page
    router.get('/game', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id) {
            return res.redirect('/homepage');
        }

        // ✅ Fetch Game Session Info
        const query = `
            SELECT gp.game_id, gp.student_id, gp.is_player_one, g.pin_code
            FROM game_players gp
            JOIN game g ON gp.game_id = g.game_id
            WHERE gp.game_id = ? AND gp.student_id = ?
        `;

        db.query(query, [game_id, studentId], (err, results) => {
            if (err || results.length === 0) {
                return res.redirect('/homepage');
            }

            const gameSession = results[0];
            const pin_code = gameSession.pin_code;

            // ✅ Fetch Players in the Current Game
            const queryPlayers = `
                SELECT gp.*, s.name 
                FROM game_players gp 
                JOIN student s ON gp.student_id = s.student_ID 
                WHERE gp.game_id = ?
            `;

            db.query(queryPlayers, [game_id], (err2, playerResults) => {
                if (err2) {
                    return res.redirect('/homepage');
                }

                let player_one_name = "";
                let player_two_name = "";
                
                playerResults.forEach(player => {
                    if (player.is_player_one) {
                        player_one_name = player.name;
                    } else {
                        player_two_name = player.name;
                    }
                });

                res.render('game', {
                    pin_code,
                    player_one_name,
                    player_two_name: player_two_name || "Waiting...",
                    is_player_one: gameSession.is_player_one
                });
            });
        });
    });

    // ✅ NEW: Route to Fetch Game State (Real-Time Updates)
    router.get('/gamestate', checkLoggedIn, (req, res) => {
        const game_id = req.session.game_id;
        if (!game_id) {
            return res.json({ success: false });
        }

        // ✅ Fetch Players & Update Frontend
        const query = `
            SELECT gp.*, s.name 
            FROM game_players gp 
            JOIN student s ON gp.student_id = s.student_ID 
            WHERE gp.game_id = ?
        `;

        db.query(query, [game_id], (err, results) => {
            if (err || results.length === 0) {
                return res.json({ success: false });
            }

            let player_one_name = "";
            let player_two_name = "";
            let is_player_one = false;

            results.forEach(player => {
                if (player.is_player_one) {
                    player_one_name = player.name;
                    if (player.student_id === req.session.student_id) {
                        is_player_one = true;
                    }
                } else {
                    player_two_name = player.name;
                }
            });

            res.json({
                success: true,
                player_one_name,
                player_two_name,
                is_player_one
            });
        });
    });

    return router;
};
