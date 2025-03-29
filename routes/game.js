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
            SELECT g.game_started, g.game_ended, g.game_end_time, 
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
            const game_end_time = results[0].game_end_time; 

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
                game_ended,
                game_end_time 
            });
        });
    });

    // ✅ Start the Match
    router.post('/startmatch', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        const gameDuration = 60 * 60 * 1000; // 10 minutes in milliseconds
        const endTime = new Date(Date.now() + gameDuration);

        const query = `
            UPDATE game 
            SET game_started = 1, game_end_time = ?
            WHERE game_id = ? AND EXISTS (
                SELECT 1 FROM game_players 
                WHERE student_id = ? AND game_id = ? AND is_player_one = 1
            )
        `;

        db.query(query, [endTime, game_id, studentId, game_id], (err) => {
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

    // ✅ Startgame Page (Dynamic Player Names + HP + Profile Pictures)
    router.get('/startgame', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id || !studentId) {
            return res.redirect('/homepage');
        }

        const query = `
            SELECT gp.student_id, gp.is_player_one, gp.HP, s.name, s.profile_picture
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
            let player_one_picture = "panda.jpg", player_two_picture = "panda.jpg"; // default

            results.forEach(p => {
                if (p.is_player_one) {
                    player_one_name = p.name;
                    player_one_hp = p.HP;
                    if (p.profile_picture) player_one_picture = p.profile_picture;
                } else {
                    player_two_name = p.name;
                    player_two_hp = p.HP;
                    if (p.profile_picture) player_two_picture = p.profile_picture;
                }
            });

            res.render('startgame', {
                player_one_name,
                player_two_name,
                player_one_hp,
                player_two_hp,
                player_one_picture,
                player_two_picture
            });
        });
    });


    // ✅ Game Timer Timeout: Determine winner by HP or declare tie
    router.post('/timeout', checkLoggedIn, (req, res) => {
        const game_id = req.session.game_id;

        if (!game_id) return res.json({ success: false });

        // 🔍 Get both players with their HP and names
        const query = `
            SELECT gp.student_id, gp.HP, s.name 
            FROM game_players gp
            JOIN student s ON gp.student_id = s.student_ID
            WHERE game_id = ?
        `;

        db.query(query, [game_id], (err, results) => {
            if (err || results.length !== 2) {
                return res.json({ success: false });
            }

            const [p1, p2] = results;

            // 🤝 If tie
            if (p1.HP === p2.HP) {
                db.query(`UPDATE game SET game_ended = 1 WHERE game_id = ?`, [game_id], () => {
                    return res.json({ success: true, tie: true });
                });
            } else {
                const winner = p1.HP > p2.HP ? p1 : p2;

                db.query(`UPDATE game SET game_ended = 1 WHERE game_id = ?`, [game_id], () => {
                    return res.json({ success: true, winner_name: winner.name });
                });
            }
        });
    });


    // ✅ New Scan QR UI Route
    router.get('/scanqr', checkLoggedIn, (req, res) => {
        if (!req.session.student_id || !req.session.game_id) {
            return res.redirect('/homepage');
        }
        res.render('scanqr'); // Make sure scanqr.pug is created in views/
    });

    return router;

    
};
