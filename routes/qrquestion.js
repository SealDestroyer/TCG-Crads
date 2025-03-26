// const express = require('express');
// const router = express.Router();

// module.exports = (db) => {
//   router.get('/qrquestion/:type/:difficulty/:value', (req, res) => {
//     const { type, difficulty, value } = req.params;

//     const questionQuery = `
//       SELECT * FROM question 
//       WHERE card_type = ? AND difficulty_level = ? AND effect_value = ?
//       ORDER BY RAND() LIMIT 1
//     `;

//     db.query(questionQuery, [type, difficulty, value], (err, questionResults) => {
//       if (err || questionResults.length === 0) {
//         return res.status(404).json({ success: false, message: "No matching question found." });
//       }

//       const question = questionResults[0];

//       const optionQuery = `
//         SELECT option_id, option_text, is_correct, reason 
//         FROM question_option 
//         WHERE question_id = ?
//       `;

//       db.query(optionQuery, [question.question_id], (err2, optionResults) => {
//         if (err2) {
//           return res.status(500).json({ success: false, message: "Error fetching options." });
//         }

//         res.json({
//           success: true,
//           question: {
//             id: question.question_id,
//             text: question.question_text,
//             card_type: question.card_type,
//             difficulty_level: question.difficulty_level,
//             effect_value: question.effect_value
//           },
//           options: optionResults
//         });
//       });
//     });
//   });

//   return router;
// };


const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/qrquestion/:type/:difficulty/:value', (req, res) => {
    const { type, difficulty, value } = req.params;
    const student_id = req.session.student_id;
    const game_id = req.session.game_id;

    if (!student_id || !game_id) {
      return res.status(401).json({ success: false, message: "Session expired." });
    }

    // Step 1: Try to get an unused question
    const filteredQuery = `
      SELECT * FROM question 
      WHERE card_type = ? AND difficulty_level = ? AND effect_value = ?
      AND question_id NOT IN (
        SELECT question_id FROM answers WHERE student_id = ? AND game_id = ?
      )
      ORDER BY RAND()
      LIMIT 1
    `;

    db.query(filteredQuery, [type, difficulty, value, student_id, game_id], (err, questionResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error." });
      }

      // If found an unused question
      if (questionResults.length > 0) {
        return sendQuestionWithOptions(questionResults[0], res, db);
      }

      // Step 2: If none left, allow repeat questions
      const fallbackQuery = `
        SELECT * FROM question 
        WHERE card_type = ? AND difficulty_level = ? AND effect_value = ?
        ORDER BY RAND()
        LIMIT 1
      `;

      db.query(fallbackQuery, [type, difficulty, value], (err2, fallbackResults) => {
        if (err2 || fallbackResults.length === 0) {
          return res.status(404).json({ success: false, message: "No questions found." });
        }

        return sendQuestionWithOptions(fallbackResults[0], res, db);
      });
    });
  });

  // Helper function to load question options and send back
  function sendQuestionWithOptions(question, res, db) {
    const optionQuery = `
      SELECT option_id, option_text, is_correct, reason 
      FROM question_option 
      WHERE question_id = ?
    `;

    console.log(`📦 Player ${res.req.session.student_id} gets question ${question.question_id} (${question.card_type} | ${question.difficulty_level} | ${question.effect_value})`);
    
    db.query(optionQuery, [question.question_id], (err, optionResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error fetching options." });
      }

      res.json({
        success: true,
        question: {
          id: question.question_id,
          text: question.question_text,
          card_type: question.card_type,
          difficulty_level: question.difficulty_level,
          effect_value: question.effect_value
        },
        options: optionResults
      });
    });
  }

  return router;
};


