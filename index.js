const app = require("express")();
const express = require("express");
const session = require("express-session");
const hbs = require("hbs");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');

const speech_to_text = require("./routes/speech_text");
const menu = require("./routes/menu");
const translate = require("./routes/translate");

require("dotenv").config();

const PORT = process.env.PORT || 4000;


// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.AUTH0_BASEURL,
  clientID: process.env.AUTH0_CLIENTID,
  issuerBaseURL: process.env.AUTH0_ISSUERBASEURL,
};


app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(express.static("frontend"));
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
app.use(auth(config));
app.set("view engine", "hbs");

app.use("/convert", speech_to_text);
app.use("/menu", menu);
app.use("/translate", translate);

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/home", requiresAuth(), (req, res) => {
    res.render(req.oidc.isAuthenticated() ? 'index' : 'home');
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

