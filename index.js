// require dotenv
require("dotenv").config();

const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index");
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
