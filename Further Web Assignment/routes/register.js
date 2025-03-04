const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');


module.exports = (db) => {
    // Check if email already exists
    router.get('/checkEmail', (req, res) => {
        const { email } = req.query;
        const query = 'SELECT * FROM student WHERE email = ?';

        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Server error');
            }

            res.json({ exists: results.length > 0 });
        });
    });

    // Register new user
    router.post('/register', (req, res) => {
        const { email, password } = req.body;

        // Hash password for security
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).send('Internal Server Error');
            }

            const query = 'INSERT INTO student (email, password) VALUES (?, ?)';

            db.query(query, [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Database insertion error:', err);
                    return res.status(500).send('Email already registered or internal error');
                }

                res.json({ message: 'Registration successful! Please log in.' });
            });
        });
    });

    return router;
};
