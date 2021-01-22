const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUsersByEmail } = require('./helpers.js');
const { urlsForUser } = require('./helpers.js');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  asm5xK: { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "test1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "test2"
  }
};

const generateRandomString = function(length = 6) {
  return Math.random().toString(20).substr(2, length);
};

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    let loggedIn = urlsForUser(urlDatabase, req.session.user_id);
    const templateVars = { urls: loggedIn, user: user };
    return res.render("urls_index", templateVars);
  } else if (!req.session.user_id) {
    res.render("urls_notloggedin");
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (req.session.user_id) {
    const templateVars = { user: user };
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.render("urls_notloggedin");
  } else if (Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
    return res.render("urls_show", templateVars);
  } else {
    res.render("urls_wronguser.ejs");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_regs");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.render("urls_notloggedin");
  } else if (Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    return res.redirect("/urls");
  } else {
    res.render("urls_wronguser.ejs");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!req.session.user_id) {
    return res.status(401).send("You do not have access to delete, please log in");
  } else if (Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    res.status(401).send("no access");
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    return res.render("urls_invalidentry.ejs");
  }
  if (getUsersByEmail(users, email)) {
    return res.render("urls_youexist.ejs");
  }
  users[id] = {id: id, email: email, password: hashedPassword}; // creates new user if both previous conditionals are false
  req.session.user_id = id;
  return res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUsersByEmail(users, email);
  const id = user.id;
  if (!user) {
    res.render("urls_invalidentry.ejs");
  } else if (!bcrypt.compareSync(password, user.password)) { // checks if user password matches
    res.render("urls_invalidentry.ejs");
  } else {
    req.session.user_id = id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null; // clears cookie when logging out
  res.redirect("/urls");
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});