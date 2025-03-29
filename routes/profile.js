const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  // ✅ 1. Setup Multer with 2MB limit
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/profilepics/");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = "profile_" + Date.now() + ext;
      cb(null, filename);
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // ✅ 2MB limit
  });

  // ✅ 2. GET /profile – Load user data
  router.get("/profile", checkLoggedIn, (req, res) => {
    const studentId = req.session.student_ID;
    if (!studentId) return res.status(401).json({ success: false });

    const sql = "SELECT name, email, contact, gender, profile_pic FROM student WHERE student_ID = ?";
    db.query(sql, [studentId], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (results.length === 0) return res.status(404).json({ success: false, message: "Student not found" });

      res.json({ success: true, ...results[0] });
    });
  });

  // ✅ 3. POST /profile – Save updates + optional image
  router.post("/profile", checkLoggedIn, (req, res) => {
    upload.single("profile_pic")(req, res, function (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Max 2MB allowed." });
      } else if (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ success: false, message: "File upload failed." });
      }

      const studentId = req.session.student_ID;
      const { name, contact, gender } = req.body;
      const pic = req.file ? req.file.filename : null;

      let updateFields = [];
      let values = [];

      if (name) { updateFields.push("name = ?"); values.push(name); }
      if (contact) { updateFields.push("contact = ?"); values.push(contact); }
      if (gender) { updateFields.push("gender = ?"); values.push(gender); }
      if (pic) { updateFields.push("profile_pic = ?"); values.push(pic); }

      if (updateFields.length === 0) {
        return res.json({ success: false, message: "Nothing to update" });
      }

      const sql = `UPDATE student SET ${updateFields.join(", ")} WHERE student_ID = ?`;
      values.push(studentId);

      db.query(sql, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Update failed" });
        }

        res.json({ success: true });
      });
    });
  });

  // ✅ 4. POST /profile/delete – Delete account
  router.post("/profile/delete", checkLoggedIn, (req, res) => {
    const studentId = req.session.student_ID;
    if (!studentId) return res.status(401).json({ success: false });

    const sql = "DELETE FROM student WHERE student_ID = ?";
    db.query(sql, [studentId], (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to delete account" });

      req.session.destroy(); // 🔒 Log out after delete
      res.json({ success: true });
    });
  });

  return router;
};
