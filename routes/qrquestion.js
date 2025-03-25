const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/qrquestion/:type/:difficulty/:value', (req, res) => {
    const { type, difficulty, value } = req.params;

    const questionQuery = `
      SELECT * FROM question 
      WHERE card_type = ? AND difficulty_level = ? AND effect_value = ?
      ORDER BY RAND() LIMIT 1
    `;

    db.query(questionQuery, [type, difficulty, value], (err, questionResults) => {
      if (err || questionResults.length === 0) {
        return res.status(404).json({ success: false, message: "No matching question found." });
      }

      const question = questionResults[0];

      const optionQuery = `
        SELECT option_id, option_text, is_correct, reason 
        FROM question_option 
        WHERE question_id = ?
      `;

      db.query(optionQuery, [question.question_id], (err2, optionResults) => {
        if (err2) {
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
    });
  });

  return router;
};
