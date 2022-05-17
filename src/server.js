const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // Heroku, or local or production

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const path = require("path");

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

// Initialize DB
const Datastore = require("nedb");
if (!fs.existsSync("db")) {
  fs.mkdirSync("db");
}

const db = new Datastore({ filename: "db/db_file", autoload: true }); // creates if does not exist

// routes
app.post("/", upload.single("image"), (req, res) => {
  const name = req.body.name;

  db.findOne({ name: name }, (err, doc) => {
    if (!doc) {
      // i.e. does not exist, make one
      db.insert(
        { name: name, filename: req.file.filename },
        function (err, doc) {
          if (!err) {
            console.log("Inserted", doc.name, "with ID", doc._id);
            res.sendStatus(200);
          } else res.sendStatus(500);
        }
      );
    } else {
      res.status(400);
      res.json({ msg: "Please use a different name" });
    }
  });
});

app.get("/:name", (req, res) => {
  const name = req.params.name;

  db.findOne({ name: name }, function (err, doc) {
    if (doc) {
      console.log("Found image:", name);
      res.status(200);
      res.sendFile(`/uploads/${doc.filename}`, {
        root: path.join(__dirname, "../"),
      });
    } else {
      console.log("Image not found:", name);
      res.status(404);
      res.end();
    }
  });
});

app.put("/:name", upload.single("image"), (req, res) => {
  const name = req.params.name;

  db.findOne({ name: name }, function (err, doc) {
    if (doc) {
      // remove record fromDB
      db.remove({ name: name });
      console.log("To be deleted: ", doc.filename, doc);

      // remove file from file-system
      fs.rm(`uploads/${doc.filename}`, {}, (err) => {
        if (!err) console.log("File deleted from file-system");
        else console.log(err);
      });

      // insert the new file
      db.insert({ name: name, filename: req.file.filename });
      res.status(200);
      res.end();
    } else {
      console.log("Image not found:", name);
      res.status(404);
      res.end();
    }
  });
});

app.delete("/:name", (req, res) => {
  const name = req.params.name;
  db.findOne({ name: name }, function (err, doc) {
    if (doc) {
      db.remove({ name: name });
      console.log("To be deleted: ", doc.filename, doc);
      fs.rm(`uploads/${doc.filename}`, {}, (err) => {
        if (!err) console.log("File deleted from file-system");
        else console.log(err);
      }); // remove from file system
      res.status(200);
      res.end();
    } else {
      console.log("Image not found:", name);
      res.status(404);
      res.end();
    }
  });
});

app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
);
