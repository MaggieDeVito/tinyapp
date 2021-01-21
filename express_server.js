const express = require("express"); // requiring express
const app = express(); // assigning function to variable app
const PORT = 8080; // port to use
const cookieParser = require('cookie-parser'); // requiring cookie parser
const bodyParser = require("body-parser"); // requiring body parser

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = { // object of urlDatabase
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  asm5xK: { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = { // object of users
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const check = function(users, userEmail) { // function to check for users 
  for(let keys in users){
    if(users[keys].email === userEmail) {
      return users[keys];
    } 
  }
  return false;
}

const urlsForUser = function (urlDatabase, userID) {
  let match = {};
  for (let keys in urlDatabase) {
    if(urlDatabase[keys].userID === userID) {
      match[keys] = urlDatabase[keys]
    }
  }
  return match;
}

const getUsers = function(users, user_id) { 
  return users[user_id];
}

const generateRandomString = function(length = 6) { // function to make random string for urls
  return Math.random().toString(20).substr(2, length);
};

app.get("/urls", (req, res) => {
  const user = getUsers(users, req.cookies["user_id"]);
  let loggedIn;
  if (!user) {
    loggedIn;
  } else { 
    loggedIn = urlsForUser(urlDatabase, user.id)
  }
  if(!loggedIn) {
    return res.redirect("/login");
  }
  if(loggedIn) {
  const templateVars = { urls: loggedIn, user: user }; 
  return res.render("urls_index", templateVars); // adds the template from urls_index to the page plus the template vars
  }
});

app.get("/urls/new", (req, res) => {
  const user = getUsers(users, req.cookies["user_id"]);
  if(!user) {
    res.redirect("/login")
  }
  const templateVars = { user: user };
  res.render("urls_new", templateVars); //adds the template from urls_new to the page plus the template vars
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL); // redirects them to the proper url
});

app.get("/urls/:shortURL", (req, res) => {
  const user = getUsers(users, req.cookies["user_id"]);
  if (!user) {
    return res.redirect("/login")
  } 
  const allUsersURLs = urlsForUser(urlDatabase, user.id);
if(Object.keys(allUsersURLs).length >= 0) {
  for(let url in allUsersURLs) {
    if (url === req.params.shortURL) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user };
      res.render("urls_show", templateVars); // adds the template from urls_show to the page plus the template vars
    } else {
      res.sendStatus(404);
    }
  } 
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
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); // directs you to urls with the proper short url
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL; 
  res.redirect("/urls"); 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls"); // redirects to urls after deleting a url from the page
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password; 
  if(email === "" || password === "") { // checking if email or password are empty
    res.sendStatus(404); // sends them not found status code
  }
  if(check(users, email)) { // checks if email already exists
    res.sendStatus(404); // sends them not found status code
  }
  users[id] = {id: id, email: email, password: password}; // creates new user if both previous conditionals are false
  res.cookie("user_id", id) // created the cookie
  res.redirect(`/urls`); // redirects back to urls
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = check(users, email);
  const id = user.id
    if(!user) { // checks if user doesnt exist
      res.sendStatus(403); // sends status code forbidden
    } else if(user.password !== password){ // checks if user password matches
      res.sendStatus(403) // sends status code forbidden
    } else {
      res.cookie("user_id", id) // adds cookie
      res.redirect("/urls"); // redirects to urls
    }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // clears cookie when logging out
  res.redirect("/urls"); // redirects to urls
})





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});