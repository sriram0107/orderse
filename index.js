const app = require("express")();
const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const cors = require("cors");
const speech_to_text = require("./routes/speech_text");
const menu = require("./routes/menu");
const translate = require("./routes/translate");
const createSession = require("./routes/createSession");
var multer = require("multer");
var upload = multer();
var bodyParser = require("body-parser");

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(express.static("frontend"));
hbs.registerPartials(__dirname + "/views/partials/");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cors());
app.use(upload.array("avatar"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "hbs");
app.use("/convert", speech_to_text);
app.use("/menu", menu);
app.use("/translate", translate);
app.use("/session", createSession);

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(5000, () => console.log("Server running on http://localhost:5000/"));

module.exports = app;
