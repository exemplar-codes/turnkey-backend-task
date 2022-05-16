const express = require("express");
const app = express();

const port = process.env.PORT || 3000; // Heroku, or local or production

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
