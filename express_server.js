const express = require("express"); // requiring express
const app = express(); // assigning function to variable app
const PORT = 8080; // port to use
const bodyParser = require("body-parser"); // requiring body parser
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const { getUsersByEmail } = require('./helpers.js');
const { urlsForUser } = require('./helpers.js')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}))

const urlDatabase = { // object of urlDatabase
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  asm5xK: { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = { // object of users
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

const generateRandomString = function(length = 6) { // function to make random string for urls
  return Math.random().toString(20).substr(2, length);
};

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]
  if (user) {
    let loggedIn = urlsForUser(urlDatabase, req.session.user_id)
    const templateVars = { urls: loggedIn, user: user }; 
    return res.render("urls_index", templateVars); // adds the template from urls_index to the page plus the template vars
  } else if (!req.session.user_id) {
    res.redirect("/login")
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if(req.session.user_id) {
    const templateVars = { user: user };
    return res.render("urls_new", templateVars); //adds the template from urls_new to the page plus the template vars
  }
  return res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL); // redirects them to the proper url
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;

  if(!userID) {
    res.status(403).send("not logged in")
  } else if(Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) {
          const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[userID] };
          return res.render("urls_show", templateVars); // adds the template from urls_show to the page plus the template vars
  } else {
    res.status(403).send("no access")
  }
});

app.get("/register", (req, res) => {
  res.render("urls_regs")
}) // adds the urls_regs template

app.get("/login", (req, res) => {
  res.render("urls_login") // adds the urls_login template
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id }
  res.redirect(`/urls/${shortURL}`); // directs you to urls with the proper short url
});

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if(!req.session.user_id) {
    res.status(403).send("not logged in")
  } else if (Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    return res.redirect("/urls")
  } else {
    res.status(404).send("invalid user");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (!req.session.user_id) {
    return res.status(401).send("You do not have access to delete, please log in")
  } else if (Object.keys(urlsForUser(urlDatabase, userID)).includes(req.params.shortURL)) { 
      delete urlDatabase[shortURL];
      return res.redirect("/urls"); // redirects to urls after deleting a url from the page
    } else {
      res.status(401).send("no access")
    }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; 
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(email === "" || password === "") { // checking if email or password are empty
    return res.status(404).send("invalid input"); // sends them not found status code
  }
  if(getUsersByEmail(users, email)) { // checks if email already exists
    return res.status(404).send("account already exists, please log in"); // sends them not found status code
  }
  users[id] = {id: id, email: email, password: hashedPassword}; // creates new user if both previous conditionals are false
  req.session.user_id = id
  return res.redirect(`/urls`); // redirects back to urls
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUsersByEmail(users, email);
  const id = user.id
    if(!user) { // checks if user doesnt exist
      res.status(403).send("no user exists, please register"); // sends status code forbidden
    } else if(!bcrypt.compareSync(password, user.password)){ // checks if user password matches
      res.status(403).send("invalid password") // sends status code forbidden
    } else {
      req.session.user_id = id;
      return res.redirect("/urls"); // redirects to urls
    }
});

app.post("/logout", (req, res) => {
  req.session = null; // clears cookie when logging out
  res.redirect("/urls"); // redirects to urls
})





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});