const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (db) => {
  // GET route for login page remains the same
  router.get('/login', (req, res) => {
    res.render('login');
  });

  // POST route for student login (AJAX-compatible)
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: 'Please enter email and password!' });
    }

    db.query('SELECT * FROM student WHERE email = ?', [email], async (error, results) => {
      if (error) {
        return res.json({ success: false, message: 'Database error. Please try again.' });
      }

      if (results.length === 0) {
        return res.json({ success: false, message: 'Incorrect email or password!' });
      }

      const student = results[0];
      const passwordMatch = await bcrypt.compare(password, student.password);

      if (!passwordMatch) {
        return res.json({ success: false, message: 'Incorrect email or password!' });
      }

      // Store session data
      req.session.loggedin = true;
      req.session.student_id = student.id;
      req.session.email = student.email;

      return res.json({ success: true, redirect: '/dashboard' });
    });
  });

  // GET route for logout remains similar
  router.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.json({ success: false, message: 'Logout failed. Please try again.' });
        }
        res.json({ success: true, redirect: '/login' });
      });
    }
  });

  return router;
};
