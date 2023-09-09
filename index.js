const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const cors = require("cors");
const speech_to_text = require("./routes/speech_text");
const menu = require("./routes/menu");
const translate = require("./routes/translate");
const multer = require("multer");
const upload = multer();
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001

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

app.get("/", (req, res) => {
  res.render("index", { url: process.env.BASE_URL });
});

app.listen(PORT, () => console.log("Server running..."));

module.exports = app;
