require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

// Middleware
app.use(express.json({ extended: false }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Mongo URI from environment variable
const mongoURI = process.env.MONGODB;

// create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// init gfs
let gfs;

conn.once("open", () => {
  // init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

// @route: GET /
// @desc: loads the index page form
app.get("/", (req, res) => {
  res.render("index");
});

// @route: POST /upload
// @desc: uploads the file to the DB
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
