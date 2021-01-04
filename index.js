const app = require("express")();
const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const cors = require("cors");
const speech_to_text = require("./routes/speech_text");
const menu = require("./routes/menu");
const translate = require("./routes/translate");
var bodyParser = require("body-parser");

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
hbs.registerPartials(__dirname + "/views/partials/");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cors());
// app.use(express.static("views/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "hbs");
app.use("/convert", speech_to_text);
app.use("/menu", menu);
app.use("/translate", translate);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/:blobid", (req, res) => {
  res.send(req.params.blobid);
});
app.listen(5000, () => console.log("Server running on http://localhost:5000/"));

module.exports = app;
