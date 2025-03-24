// const express = require('express');

// module.exports = (db, checkLoggedIn) => {
//     const router = express.Router();

//     // ✅ Route to Render Game Page
//     router.get('/game', checkLoggedIn, (req, res) => {
//         const studentId = req.session.student_id;
//         const game_id = req.session.game_id;

//         if (!game_id) {
//             return res.redirect('/homepage');
//         }

//         // ✅ Fetch Game Session Info
//         const query = `
//             SELECT gp.game_id, gp.student_id, gp.is_player_one, g.pin_code
//             FROM game_players gp
//             JOIN game g ON gp.game_id = g.game_id
//             WHERE gp.game_id = ? AND gp.student_id = ?
//         `;

//         db.query(query, [game_id, studentId], (err, results) => {
//             if (err || results.length === 0) {
//                 return res.redirect('/homepage');
//             }

//             const gameSession = results[0];
//             const pin_code = gameSession.pin_code;

//             // ✅ Fetch Players in the Current Game
//             const queryPlayers = `
//                 SELECT gp.*, s.name 
//                 FROM game_players gp 
//                 JOIN student s ON gp.student_id = s.student_ID 
//                 WHERE gp.game_id = ?
//             `;

//             db.query(queryPlayers, [game_id], (err2, playerResults) => {
//                 if (err2) {
//                     return res.redirect('/homepage');
//                 }

//                 let player_one_name = "";
//                 let player_two_name = "";
                
//                 playerResults.forEach(player => {
//                     if (player.is_player_one) {
//                         player_one_name = player.name;
//                     } else {
//                         player_two_name = player.name;
//                     }
//                 });

//                 res.render('game', {
//                     pin_code,
//                     player_one_name,
//                     player_two_name: player_two_name || "Waiting...",
//                     is_player_one: gameSession.is_player_one
//                 });
//             });
//         });
//     });

//     // ✅ NEW: Route to Fetch Game State (Real-Time Updates)
//     router.get('/gamestate', checkLoggedIn, (req, res) => {
//         const game_id = req.session.game_id;
//         if (!game_id) {
//             return res.json({ success: false });
//         }

//         // ✅ Fetch Players & Update Frontend
//         const query = `
//             SELECT gp.*, s.name 
//             FROM game_players gp 
//             JOIN student s ON gp.student_id = s.student_ID 
//             WHERE gp.game_id = ?
//         `;

//         db.query(query, [game_id], (err, results) => {
//             if (err || results.length === 0) {
//                 return res.json({ success: false });
//             }

//             let player_one_name = "";
//             let player_two_name = "";
//             let is_player_one = false;

//             results.forEach(player => {
//                 if (player.is_player_one) {
//                     player_one_name = player.name;
//                     if (player.student_id === req.session.student_id) {
//                         is_player_one = true;
//                     }
//                 } else {
//                     player_two_name = player.name;
//                 }
//             });

//             res.json({
//                 success: true,
//                 player_one_name,
//                 player_two_name,
//                 is_player_one
//             });
//         });
//     });

//     return router;
// };

const express = require('express');

module.exports = (db, checkLoggedIn) => {
    const router = express.Router();

    // ✅ Game Lobby - Waiting Room
    router.get('/game', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id) return res.redirect('/homepage');

        const query = `
            SELECT gp.game_id, gp.student_id, gp.is_player_one, g.pin_code
            FROM game_players gp
            JOIN game g ON gp.game_id = g.game_id
            WHERE gp.game_id = ? AND gp.student_id = ?
        `;

        db.query(query, [game_id, studentId], (err, results) => {
            if (err || results.length === 0) return res.redirect('/homepage');

            const gameSession = results[0];
            const pin_code = gameSession.pin_code;

            const queryPlayers = `
                SELECT gp.*, s.name 
                FROM game_players gp 
                JOIN student s ON gp.student_id = s.student_ID 
                WHERE gp.game_id = ?
            `;

            db.query(queryPlayers, [game_id], (err2, playerResults) => {
                if (err2) return res.redirect('/homepage');

                let player_one_name = "", player_two_name = "";
                playerResults.forEach(player => {
                    if (player.is_player_one) player_one_name = player.name;
                    else player_two_name = player.name;
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

// ✅ Cleaned /gamestate route (production-ready)
router.get('/gamestate', checkLoggedIn, (req, res) => {
    const game_id = req.session.game_id;
    const student_id = req.session.student_id;

    if (!game_id) {
        return res.json({ success: false });
    }

    const query = `
        SELECT g.game_started, g.game_ended,
               gp.HP, gp.is_player_one, gp.student_id,
               s.name
        FROM game_players gp
        JOIN student s ON gp.student_id = s.student_ID 
        JOIN game g ON g.game_id = gp.game_id
        WHERE gp.game_id = ?
    `;

    db.query(query, [game_id], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false });
        }

        let player_one_name = "", player_two_name = "";
        let player_one_hp = 0, player_two_hp = 0;
        let is_player_one = false;
        const game_started = results[0].game_started;
        const game_ended = results[0].game_ended;

        results.forEach(player => {
            if (player.is_player_one) {
                player_one_name = player.name;
                player_one_hp = player.HP;
                if (player.student_id === student_id) {
                    is_player_one = true;
                }
            } else {
                player_two_name = player.name;
                player_two_hp = player.HP;
            }
        });

        res.json({
            success: true,
            player_one_name,
            player_two_name,
            player_one_hp,
            player_two_hp,
            is_player_one,
            game_started,
            game_ended
        });
    });
});

    // ✅ Start the Match
    router.post('/startmatch', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        const query = `
            UPDATE game 
            SET game_started = 1 
            WHERE game_id = ? AND EXISTS (
                SELECT 1 FROM game_players 
                WHERE student_id = ? AND game_id = ? AND is_player_one = 1
            )
        `;

        db.query(query, [game_id, studentId, game_id], (err) => {
            if (err) {
                console.error("Error starting match:", err);
                return res.json({ success: false, message: "Failed to start match." });
            }
            return res.json({ success: true });
        });
    });

    // ✅ Exit Game (Set quitter HP = 0 and end game)
    router.post('/exitgame', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id || !studentId) {
            return res.json({ success: false, message: "Invalid session." });
        }

        const findPlayerQuery = `
            SELECT is_player_one 
            FROM game_players 
            WHERE game_id = ? AND student_id = ?
        `;

        db.query(findPlayerQuery, [game_id, studentId], (err, result) => {
            if (err || result.length === 0) {
                return res.json({ success: false, message: "Player not found." });
            }

            const updateHPQuery = `
                UPDATE game_players 
                SET HP = 0 
                WHERE game_id = ? AND student_id = ?
            `;

            db.query(updateHPQuery, [game_id, studentId], (err2) => {
                if (err2) {
                    return res.json({ success: false, message: "Failed to update HP." });
                }

                const endGameQuery = `UPDATE game SET game_ended = 1 WHERE game_id = ?`;
                db.query(endGameQuery, [game_id], (err3) => {
                    if (err3) {
                        return res.json({ success: false, message: "Failed to end game." });
                    }

                    return res.json({ success: true, loser: true });
                });
            });
        });
    });

    // ✅ Startgame Page (Dynamic Player Names + HP)
    router.get('/startgame', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id || !studentId) {
            return res.redirect('/homepage');
        }

        const query = `
            SELECT gp.student_id, gp.is_player_one, gp.HP, s.name
            FROM game_players gp
            JOIN student s ON gp.student_id = s.student_ID
            WHERE gp.game_id = ?
        `;

        db.query(query, [game_id], (err, results) => {
            if (err || results.length < 2) {
                console.error("Error fetching player info for startgame:", err);
                return res.redirect('/homepage');
            }

            let player_one_name = "", player_two_name = "";
            let player_one_hp = 0, player_two_hp = 0;

            results.forEach(p => {
                if (p.is_player_one) {
                    player_one_name = p.name;
                    player_one_hp = p.HP;
                } else {
                    player_two_name = p.name;
                    player_two_hp = p.HP;
                }
            });

            res.render('startgame', {
                player_one_name,
                player_two_name,
                player_one_hp,
                player_two_hp
            });
        });
    });

    return router;
};

