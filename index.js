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
  gfs.files.find().toArray((err, files) => {
    // check if files exist
    if (!files || files.length === 0) {
      res.render("index", { files: false });
    } else {
      files.map((file) => {
        if (
          file.contentType === "image/jpeg" ||
          file.contentType === "image/png"
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });

      res.render("index", { files: files });
    }
  });
});

// @route: POST /upload
// @desc: uploads the file to the DB
app.post("/upload", upload.single("file"), (req, res) => {
  /*  res.json({ file: req.file }); */
  res.redirect("/");
});

// @route: GET /files
// @desc: display all files in JSON
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // check if files exist
    if (!files || files.length === 0) {
      return res.status(404).json({
        message: "No files found",
      });
    }
    // files exist
    return res.json(files);
  });
});

// @route: GET /files/:filename
// @desc: display single file in JSON
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        message: "No file found",
      });
    }
    // file exists
    return res.json(file);
  });
});

// @route: GET /image/:filename
// @desc: display image
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        message: "No file found",
      });
    }
    // check if file type is image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "not an image",
      });
    }
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
