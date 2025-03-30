const express = require('express');

module.exports = (db, checkLoggedIn) => {
    const router = express.Router();

    router.post('/cancelgame', checkLoggedIn, (req, res) => {
        const studentId = req.session.student_id;
        const game_id = req.session.game_id;

        if (!game_id) {
            return res.json({ success: false, message: "No active game found in session" });
        }

        // ✅ Verify that Player 1 is canceling the game
        const query = `SELECT game_id, is_player_one FROM game_players WHERE student_id = ? AND game_id = ?`;
        db.query(query, [studentId, game_id], (err, results) => {
            if (err || results.length === 0) {
                console.error("Error fetching game session", err);
                return res.json({ success: false, message: "No active game found" });
            }

            const gameSession = results[0];
            if (!gameSession.is_player_one) {
                return res.json({ success: false, message: "Only Player 1 can cancel the game" });
            }

            // ✅ Delete players and game session
            const deleteGamePlayersQuery = `DELETE FROM game_players WHERE game_id = ?`;
            db.query(deleteGamePlayersQuery, [game_id], (err2) => {
                if (err2) {
                    console.error("Error deleting game players", err2);
                    return res.json({ success: false, message: "Error cancelling game" });
                }

                const deleteGameQuery = `DELETE FROM game WHERE game_id = ?`;
                db.query(deleteGameQuery, [game_id], (err3) => {
                    if (err3) {
                        console.error("Error deleting game", err3);
                        return res.json({ success: false, message: "Error cancelling game" });
                    }

                    // ✅ Clear session
                    req.session.game_id = null;

                    return res.json({ success: true, redirect: '/homepage' });
                });
            });
        });
    });

    return router;
};
