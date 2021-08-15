require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

// Middleware
app.use(express.json({ extended: false }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("index");
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
