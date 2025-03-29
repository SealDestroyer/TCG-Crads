const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  // ✅ Multer setup – save uploaded profile pictures to /public/img/
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/img/"); // ✅ saving directly into img folder
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = "profile_" + Date.now() + ext;
      cb(null, filename);
    }
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
  });

  // ✅ GET /profile – Load user profile data
  router.get("/profile", checkLoggedIn, (req, res) => {
    console.log("🔍 SESSION DATA:", req.session);
    const student_id = req.session.student_id;

    if (!student_id) {
      console.log("❌ student_id missing in session");
      return res.status(401).json({ success: false });
    }

    const sql = "SELECT name, email, contact, gender, profile_picture FROM student WHERE student_ID = ?";
    db.query(sql, [student_id], (err, results) => {
      if (err) {
        console.error("💥 DB Error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length === 0) {
        console.log("⚠️ No student found for ID:", student_id);
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      console.log("✅ Loaded student profile:", results[0]);
      res.json({ success: true, ...results[0] });
    });
  });

  // ✅ POST /profile – Update profile info & optional profile picture
  router.post("/profile", checkLoggedIn, (req, res) => {
    upload.single("profile_pic")(req, res, function (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Max 2MB allowed." });
      } else if (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ success: false, message: "File upload failed." });
      }

      const student_id = req.session.student_id;
      const { name, contact, gender } = req.body;
      const pic = req.file ? req.file.filename : null;

      let updateFields = [];
      let values = [];

      if (name) { updateFields.push("name = ?"); values.push(name); }
      if (contact) { updateFields.push("contact = ?"); values.push(contact); }
      if (gender) { updateFields.push("gender = ?"); values.push(gender); }
      if (pic) { updateFields.push("profile_picture = ?"); values.push(pic); }

      if (updateFields.length === 0) {
        return res.json({ success: false, message: "Nothing to update" });
      }

      const sql = `UPDATE student SET ${updateFields.join(", ")} WHERE student_ID = ?`;
      values.push(student_id);

      db.query(sql, values, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Update failed" });
        }

        console.log("✅ Profile updated for student_id:", student_id);
        res.json({ success: true });
      });
    });
  });

  // ✅ POST /profile/delete – Delete student account
  router.post("/profile/delete", checkLoggedIn, (req, res) => {
    const student_id = req.session.student_id;

    if (!student_id) return res.status(401).json({ success: false });

    const sql = "DELETE FROM student WHERE student_ID = ?";
    db.query(sql, [student_id], (err) => {
      if (err) {
        console.error("❌ Failed to delete account:", err);
        return res.status(500).json({ success: false, message: "Failed to delete account" });
      }

      req.session.destroy();
      console.log("🗑️ Account deleted for student_id:", student_id);
      res.json({ success: true });
    });
  });

  return router;
};
    