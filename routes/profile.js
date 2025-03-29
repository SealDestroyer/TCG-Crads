const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = (db, checkLoggedIn) => {
  const router = express.Router();

  // 1. Render profile UI (pug)
  router.get("/profile", checkLoggedIn, (req, res) => {
    res.render("profile");
  });

  // 2. Get profile data (AJAX)
  router.get("/profile/data", checkLoggedIn, (req, res) => {
    const student_id = req.session.student_id;
    if (!student_id) return res.status(401).json({ success: false });

    const sql = "SELECT name, email, contact, gender, profile_picture FROM student WHERE student_ID = ?";
    db.query(sql, [student_id], (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (results.length === 0) return res.status(404).json({ success: false, message: "Student not found" });

      res.json({ success: true, ...results[0] });
    });
  });

  // Multer config
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/img"),
    filename: (req, file, cb) => cb(null, "profile_" + Date.now() + path.extname(file.originalname))
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  });

  // 3. Save profile updates (auto-delete old image)
  router.post("/profile", checkLoggedIn, (req, res) => {
    upload.single("profile_pic")(req, res, function (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE")
        return res.status(400).json({ success: false, message: "File too large. Max 2MB allowed." });
      else if (err) return res.status(500).json({ success: false, message: "Upload failed." });

      const student_id = req.session.student_id;
      const { name, contact, gender } = req.body;
      const newPic = req.file ? req.file.filename : null;

      const getOldPicSQL = "SELECT profile_picture FROM student WHERE student_ID = ?";
      db.query(getOldPicSQL, [student_id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "DB error on fetch" });

        const oldPic = results[0]?.profile_picture;
        const updateFields = [];
        const values = [];

        if (name)    { updateFields.push("name = ?"); values.push(name); }
        if (contact) { updateFields.push("contact = ?"); values.push(contact); }
        if (gender)  { updateFields.push("gender = ?"); values.push(gender); }
        if (newPic)  { updateFields.push("profile_picture = ?"); values.push(newPic); }

        if (updateFields.length === 0)
          return res.json({ success: false, message: "Nothing to update" });

        const updateSQL = `UPDATE student SET ${updateFields.join(", ")} WHERE student_ID = ?`;
        values.push(student_id);

        db.query(updateSQL, values, (err) => {
          if (err) return res.status(500).json({ success: false, message: "Update failed" });

          if (newPic && oldPic) {
            const filePath = path.join(__dirname, "..", "public", "img", oldPic);
            fs.unlink(filePath, () => {}); // fail silently if file not found
          }

          res.json({ success: true });
        });
      });
    });
  });

  // 4. Delete account
  router.post("/profile/delete", checkLoggedIn, (req, res) => {
    const student_id = req.session.student_id;
    if (!student_id) return res.status(401).json({ success: false });

    const sql = "DELETE FROM student WHERE student_ID = ?";
    db.query(sql, [student_id], (err) => {
      if (err) return res.status(500).json({ success: false, message: "Delete failed" });

      req.session.destroy();
      res.json({ success: true });
    });
  });

  return router;
};
