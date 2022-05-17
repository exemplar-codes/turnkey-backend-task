const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // Heroku, or local or production

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// import form image data
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// const db = mongoose.connect("");

/*
Initialize DB
*/

app.post("/", upload.single("image"), (req, res) => {
  const name = req.body.name;

  const id = String(Math.floor(Math.random() * 1e9)); // give an id
  console.log({ ...req.file, name, id });
  res.sendStatus(200);
});

app.get("/:id", (req, res) => {
  const id = req.params.id;
  res.status(200).send("I'm in");
});

app.put("/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
});

app.delete("/:id", (req, res) => {
  const id = req.params.id;
});

app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
