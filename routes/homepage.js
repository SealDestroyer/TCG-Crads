// const express = require('express');
// const session = require('express-session');

// module.exports = (db, checkLoggedIn) => {
//   const router = express.Router();

//   // GET route for homepage (unchanged)
// router.get('/homepage', checkLoggedIn, (req, res) => {
//   console.log("Session Data:", req.session.student_id); // Debugging line

//   res.render('homepage', { 
//     student_ID: req.session.student_id, 
//     email: req.session.email,
//     name: req.session.name  // Add this line
//   });
// });

//   // Helper function to generate a random pin code
//   function generatePinCode(length = 6) {
//     const characters = '123456789abcdefghijklmnopqrstuvwxyz';
//     let pin = '';
//     for (let i = 0; i < length; i++) {
//       pin += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return pin;
//   }

//   // POST route to start a new game
//   router.post('/startgame', checkLoggedIn, (req, res) => {
//     const studentId = req.session.student_id;
//     // Generate a new pin code
//     const pin_code = generatePinCode();

//     // Insert into game table (assuming game_id is auto-generated)
//     const insertGameQuery = 'INSERT INTO game (pin_code) VALUES (?)';
//     db.query(insertGameQuery, [pin_code], (err, result) => {
//       if (err) {
//         console.error("Error inserting into game table:", err);
//         return res.json({ success: false, message: "Error starting game" });
//       }
//       const game_id = result.insertId;

//       // Insert into game_players table with HP = 1000 and is_player_one = TRUE
//       const insertPlayerQuery = 'INSERT INTO game_players (game_id, student_id, HP, is_player_one) VALUES (?, ?, 1000, true)';
//       db.query(insertPlayerQuery, [game_id, studentId], (err2, result2) => {
//         if (err2) {
//           console.error("Error inserting into game_players table:", err2);
//           return res.json({ success: false, message: "Error adding player to game" });
//         }
//         // Success: redirect the player to the game page
//         return res.json({ success: true, redirect: '/game' });
//       });
//     });
//   });

//   return router;
// };

const express = require('express');
const session = require('express-session');

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  // GET route for homepage (unchanged)
  router.get('/homepage', checkLoggedIn, (req, res) => {
    console.log("Session Data:", req.session.student_id); // Debugging line

    res.render('homepage', { 
      student_ID: req.session.student_id, 
      email: req.session.email,
      name: req.session.name
    });
  });

  // Helper function to generate a random pin code
  function generatePinCode(length = 6) {
    const characters = '123456789abcdefghijklmnopqrstuvwxyz';
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return pin;
  }

  // POST route to start a new game
  router.post('/startgame', checkLoggedIn, (req, res) => {
    const studentId = req.session.student_id;
    // Generate a new pin code
    const pin_code = generatePinCode();

    // Insert into game table (assuming game_id is auto-generated)
    const insertGameQuery = 'INSERT INTO game (pin_code) VALUES (?)';
    db.query(insertGameQuery, [pin_code], (err, result) => {
      if (err) {
        console.error("Error inserting into game table:", err);
        return res.json({ success: false, message: "Error starting game" });
      }
      const game_id = result.insertId;

      // Insert into game_players table with HP = 1000 and is_player_one = TRUE
      const insertPlayerQuery = 'INSERT INTO game_players (game_id, student_id, HP, is_player_one) VALUES (?, ?, 1000, true)';
      db.query(insertPlayerQuery, [game_id, studentId], (err2, result2) => {
        if (err2) {
          console.error("Error inserting into game_players table:", err2);
          return res.json({ success: false, message: "Error adding player to game" });
        }
        // Store the game_id in the session
        req.session.game_id = game_id;
        // Explicitly save the session before sending the response
        req.session.save((err) => {
          if (err) {
            console.error("Error saving session:", err);
            return res.json({ success: false, message: "Error saving session" });
          }
          // Success: redirect the player to the game page
          return res.json({ success: true, redirect: '/game' });
        });
      });
    });
  });

  return router;
};
