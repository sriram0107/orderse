const app = require("express")();
const session = require("express-session");
const hbs = require("hbs");
const cors = require("cors");
const speech_to_text = require("./routes/speech_text");
const menu = require("./routes/menu");
const translate = require("./routes/translate");
var bodyParser = require("body-parser");

hbs.registerPartials(__dirname + "/views/partials/");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cors());
app.use(express.static("views/images"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "hbs");
app.use("/convert", speech_to_text);
app.use("/menu", menu);
app.use("/translate/:from/:to", translate);

app.listen(5000, () => console.log("Server running on http://localhost:5000/"));
