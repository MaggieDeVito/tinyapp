const getUsersByEmail = function(users, userEmail) { // function to check for users 
  for(let keys in users){
    if(users[keys].email === userEmail) {
      return users[keys];
    } 
  }
  return false;
}

const urlsForUser = function (database, ID) {
  let match = {};
  for (let keys in database) {
    if(database[keys].userID === ID) {
      match[keys] = database[keys]
    }
  }
  return match;
}

module.exports = {
  getUsersByEmail,
  urlsForUser
}