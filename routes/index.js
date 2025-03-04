const express = require('express');
const session = require('express-session');

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  router.get('/index', checkLoggedIn, (req, res) => {
    console.log("hello");
    console.log("Session Data:", req.session.student_id); // Debugging line

    res.render('index', { 
      student_ID: req.session.student_id, 
      email: req.session.email 
    });
  });

  return router;
};
